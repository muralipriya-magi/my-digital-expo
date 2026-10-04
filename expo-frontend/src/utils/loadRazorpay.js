import api from "../api/axios"

let razorpayLoader

export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true)
  if (razorpayLoader) return razorpayLoader

  razorpayLoader = new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

  return razorpayLoader
}

// The server creates the order and verifies the signature.  This keeps the
// Razorpay secret on the server and works with both Razorpay test and live keys.
export async function completeRazorpayPayment(order) {
  const loaded = await loadRazorpayScript()
  if (!loaded || !window.Razorpay) {
    throw new Error("Razorpay checkout could not be loaded. Please check your internet connection.")
  }

  return new Promise((resolve, reject) => {
    let settled = false
    const cancelPendingPayment = () => {
      void api.post("finance/razorpay/cancel/", { transaction_id: order.transaction_id }).catch(() => {})
    }
    const rejectOnce = (error, cancel = false) => {
      if (settled) return
      settled = true
      if (cancel) cancelPendingPayment()
      reject(error)
    }
    const checkout = new window.Razorpay({
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: order.name,
      description: order.description,
      order_id: order.order_id,
      prefill: order.prefill,
      handler: async (payment) => {
        try {
          const { data } = await api.post("finance/razorpay/verify/", {
            transaction_id: order.transaction_id,
            ...payment,
          })
          if (!settled) {
            settled = true
            resolve(data)
          }
        } catch (error) {
          rejectOnce(error)
        }
      },
      modal: {
        ondismiss: () => rejectOnce(new Error("Payment was cancelled."), true),
      },
      theme: { color: "#C2185B" },
    })

    checkout.on("payment.failed", (response) => {
      rejectOnce(new Error(response.error?.description || "Razorpay could not complete the payment."), true)
    })
    checkout.open()
  })
}
