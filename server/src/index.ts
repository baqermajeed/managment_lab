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
const designer = z.enum([
  'عصام',
  'خليل',
  'بو جبريل',
  'احمد',
  'مصمم g',
  'انصاري',
  'حمزة',
])
const buildUp = z.enum(['ام زين', 'لوزان', 'راجا', 'ابو ميار'])

const createCaseSchema = z.object({
  doctorName: z.string().min(1).max(120),
  patientName: z.string().min(1).max(120),
  workType,
  units: z.number().int().min(1).max(999),
  designer,
  buildUp,
})

type CaseDoc = {
  doctorName: string
  patientName: string
  workType: z.infer<typeof workType>
  units: number
  designer: z.infer<typeof designer>
  buildUp: z.infer<typeof buildUp>
  createdAt: Date
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

app.get('/api/cases', async (_req, res) => {
  const docs = await CaseModel.find().sort({ createdAt: -1 }).lean()
  res.json(docs.map(toApiCase))
})

app.post('/api/cases', async (req, res) => {
  const parsed = createCaseSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'بيانات غير صحيحة', issues: parsed.error.issues })
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

