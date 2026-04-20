import type { Question } from '@/types'

export interface ConsistencyReport {
  ok: boolean
  warnings: string[]
  reverseDiscrepancy: number
}

export function checkConsistency(
  questions: Question[],
  answers: Record<string, string | number>,
): ConsistencyReport {
  const warnings: string[] = []
  let reverseDiscrepancy = 0

  const reverseQuestions = questions.filter((q) => q.reverseScored)
  const normalQuestions = questions.filter((q) => !q.reverseScored && q.consistencyTag)

  for (const rq of reverseQuestions) {
    const ans = answers[rq.id]
    if (ans === undefined) continue
    const matching = normalQuestions.filter((q) => q.consistencyTag === rq.consistencyTag)
    for (const nq of matching) {
      const nAns = answers[nq.id]
      if (nAns === undefined) continue
      const rScore = typeof ans === 'number' ? ans : 3
      const nScore = typeof nAns === 'number' ? nAns : 3
      const discrepancy = Math.abs(rScore - (6 - nScore))
      if (discrepancy > 2) {
        reverseDiscrepancy += discrepancy
        warnings.push(`题目 ${rq.id} 与 ${nq.id} 存在反向不一致`)
      }
    }
  }

  return {
    ok: warnings.length === 0,
    warnings,
    reverseDiscrepancy,
  }
}
