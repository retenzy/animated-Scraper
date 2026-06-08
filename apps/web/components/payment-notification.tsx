'use client'

export default function PaymentNotification({
  paymentStatus,
  onClose,
}: {
  paymentStatus: { status: string; message: string } | null
  onClose: () => void
}) {
  if (!paymentStatus) return null

  const bgColors: Record<string, string> = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    verifying: 'bg-purple-600',
  }

  return (
    <div className={`${bgColors[paymentStatus.status] || 'bg-purple-600'} text-white px-6 py-4 flex items-center justify-between text-sm font-medium relative z-30`}>
      <p>{paymentStatus.message}</p>
      {paymentStatus.status !== 'verifying' && (
        <button onClick={onClose} className="bg-transparent border-none text-white text-xl cursor-pointer">&times;</button>
      )}
    </div>
  )
}
