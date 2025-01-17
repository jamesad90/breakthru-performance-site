import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: Request) {
  try {
    const { plan, price, name, email, phone }: { plan: string, price: string, name: string, email: string, phone: string } = await request.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: plan,
            },
            unit_amount: parseInt(price) * 100, // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/plans`,
      customer_email: email,
      metadata: {
        name,
        phone,
        plan
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 })
  }
}