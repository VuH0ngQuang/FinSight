import { useState } from 'react'
import Modal from '../ui/Modal'
import { SURVEY_QUESTIONS, scoresFromAnswers, matrixFromScores } from '../../utils/ahp'

interface Props {
  open: boolean
  onClose: () => void
  onComplete: (matrix: number[][]) => void
}

const InvestmentPrioritySurveyModal = ({ open, onClose, onComplete }: Props) => {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>(Array(SURVEY_QUESTIONS.length).fill(-1))

  const question = SURVEY_QUESTIONS[step]
  const total = SURVEY_QUESTIONS.length
  const chosen = answers[step]

  const handleSelect = (optIdx: number) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[step] = optIdx
      return next
    })
  }

  const handleNext = () => {
    if (step < total - 1) setStep((s) => s + 1)
    else finish()
  }

  const handleBack = () => setStep((s) => Math.max(0, s - 1))

  const handleSkip = () => {
    setAnswers((prev) => {
      const next = [...prev]
      next[step] = -1
      return next
    })
    handleNext()
  }

  const finish = () => {
    const scores = scoresFromAnswers(answers)
    const matrix = matrixFromScores(scores)
    onComplete(matrix)
    handleReset()
    onClose()
  }

  const handleReset = () => {
    setStep(0)
    setAnswers(Array(SURVEY_QUESTIONS.length).fill(-1))
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const isLast = step === total - 1

  return (
    <Modal open={open} onClose={handleClose} title="Investment Priority Survey" size="lg">
      {/* Progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Step {step + 1} of {total}</span>
          <span>{Math.round(((step + 1) / total) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-100">
          <div
            className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <p className="text-sm font-semibold text-slate-800 mb-4">{question.text}</p>

      {/* Options */}
      <div className="space-y-2 mb-6">
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors ${
              chosen === idx
                ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span
              className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border mr-3 ${
                chosen === idx ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
              }`}
            >
              {chosen === idx && (
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </span>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSkip}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Skip
        </button>

        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={chosen === -1}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLast ? 'Apply Weights' : 'Next'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default InvestmentPrioritySurveyModal
