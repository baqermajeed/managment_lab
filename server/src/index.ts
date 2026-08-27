import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { z } from 'zod'

const envSchema = z.object({
  MONGO_URI: z.string().min(1),
  PORT: z.coerce.number().default(4000),
})

const env = envSchema.parse({
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT ?? '4000',
})

const app = express()
app.use(cors())
app.use(express.json())

const workType = z.enum(['Zercon', 'Ceramic', 'E-max'])
const teamKind = z.enum(['designer', 'buildUp'])

const DEFAULT_DESIGNERS = [
  'عصام',
  'خليل',
  'بو جبريل',
  'احمد',
  'مصمم g',
  'انصاري',
  'حمزة',
]
const DEFAULT_BUILD_UPS = ['ام زين', 'لوزان', 'راجا', 'ابو ميار']

const createCaseSchema = z.object({
  doctorName: z.string().min(1).max(120),
  patientName: z.string().min(1).max(120),
  workType,
  units: z.number().int().min(1).max(999),
  designer: z.string().min(1).max(120),
  buildUp: z.string().min(1).max(120),
})

const hideTeamOptionSchema = z.object({
  kind: teamKind,
  name: z.string().min(1).max(120),
})

type CaseDoc = {
  doctorName: string
  patientName: string
  workType: z.infer<typeof workType>
  units: number
  designer: string
  buildUp: string
  createdAt: Date
}

type TeamMemberDoc = {
  kind: z.infer<typeof teamKind>
  name: string
  hidden: boolean
  order?: number
}

const caseSchema = new mongoose.Schema<CaseDoc>(
  {
    doctorName: { type: String, required: true, trim: true },
    patientName: { type: String, required: true, trim: true },
    workType: { type: String, required: true },
    units: { type: Number, required: true },
    designer: { type: String, required: true },
    buildUp: { type: String, required: true },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { versionKey: false },
)

const CaseModel = mongoose.model('Case', caseSchema)

const teamMemberSchema = new mongoose.Schema<TeamMemberDoc>(
  {
    kind: { type: String, required: true, enum: ['designer', 'buildUp'] },
    name: { type: String, required: true, trim: true },
    hidden: { type: Boolean, required: true, default: false },
    order: { type: Number, default: 0 },
  },
  { versionKey: false },
)
teamMemberSchema.index({ kind: 1, name: 1 }, { unique: true })

const TeamMemberModel = mongoose.model('TeamMember', teamMemberSchema)

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function seedTeamMembers() {
  const defaults = [
    ...DEFAULT_DESIGNERS.map((name) => ({ kind: 'designer' as const, name })),
    ...DEFAULT_BUILD_UPS.map((name) => ({ kind: 'buildUp' as const, name })),
  ]

  await Promise.all(
    defaults.map((member, index) =>
      TeamMemberModel.updateOne(
        { kind: member.kind, name: member.name },
        { $setOnInsert: { hidden: false, order: index } },
        { upsert: true },
      ),
    ),
  )
}

async function visibleNames(kind: z.infer<typeof teamKind>) {
  const docs = await TeamMemberModel.find({ kind, hidden: { $ne: true } })
    .sort({ order: 1, name: 1 })
    .lean()
  return docs.map((d) => d.name)
}

function toApiCase(doc: any) {
  return {
    id: String(doc._id),
    doctorName: doc.doctorName,
    patientName: doc.patientName,
    workType: doc.workType,
    units: doc.units,
    designer: doc.designer,
    buildUp: doc.buildUp,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/cases', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  const filter: Record<string, unknown> = {}

  if (q) {
    const regex = new RegExp(escapeRegex(q), 'i')
    const or: Record<string, unknown>[] = [
      { doctorName: regex },
      { patientName: regex },
      { workType: regex },
      { designer: regex },
      { buildUp: regex },
    ]
    if (/^\d+$/.test(q)) {
      or.push({ units: Number(q) })
    }
    filter.$or = or
  }

  const docs = await CaseModel.find(filter).sort({ createdAt: -1 }).lean()
  res.json(docs.map(toApiCase))
})

app.get('/api/team-options', async (_req, res) => {
  const [designers, buildUps] = await Promise.all([
    visibleNames('designer'),
    visibleNames('buildUp'),
  ])
  res.json({ designers, buildUps })
})

app.post('/api/team-options/hide', async (req, res) => {
  const parsed = hideTeamOptionSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'بيانات غير صحيحة', issues: parsed.error.issues })
  }

  await TeamMemberModel.updateOne(
    { kind: parsed.data.kind, name: parsed.data.name },
    {
      $set: { hidden: true },
      $setOnInsert: { kind: parsed.data.kind, name: parsed.data.name, order: 999 },
    },
    { upsert: true },
  )

  const [designers, buildUps] = await Promise.all([
    visibleNames('designer'),
    visibleNames('buildUp'),
  ])
  res.json({ designers, buildUps })
})

app.post('/api/cases', async (req, res) => {
  const parsed = createCaseSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'بيانات غير صحيحة', issues: parsed.error.issues })
  }

  const [designers, buildUps] = await Promise.all([
    visibleNames('designer'),
    visibleNames('buildUp'),
  ])
  if (!designers.includes(parsed.data.designer) || !buildUps.includes(parsed.data.buildUp)) {
    return res.status(400).json({
      message: 'المصمم أو Build Up غير متاح في قائمة الإضافة',
    })
  }

  const created = await CaseModel.create(parsed.data)
  res.status(201).json(toApiCase(created))
})

app.delete('/api/cases/:id', async (req, res) => {
  const id = req.params.id
  await CaseModel.findByIdAndDelete(id)
  res.status(204).send()
})

async function main() {
  await mongoose.connect(env.MONGO_URI)
  await seedTeamMembers()
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.PORT}`)
  })
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})

