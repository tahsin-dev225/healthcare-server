import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { AppointmentStatus, PaymentStatus } from "../../../generated/prisma/enums";


const handleStripeWebhookEvent = async (event: Stripe.Event) => {

  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id
    }
  })

  if (existingPayment) {
    console.log(`Event ${event.id} alrealy procced. Skiping`);
    return { message: `Event ${event.id} alrealy procced. Skiping` }
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object

      const appointmentId = session.metadata?.appointmentId;
      const paymentId = session.metadata?.paymentId;

      if (!appointmentId || !paymentId) {
        console.log("missing appointmentId or paymentId");
        return { message: "missing appointmentId or paymentId" }
      }

      const appointment = await prisma.appointment.findUnique({
        where: {
          id: appointmentId
        }
      })

      if (!appointment) {
        console.log("appointment not found");
        return { message: "appointment not found" }
      }

      await prisma.$transaction(async (tx) => {
        await tx.appointment.update({
          where: {
            id: appointmentId
          },
          data: {
            paymentStatus: session.payment_status === 'paid' ? PaymentStatus.PAID : PaymentStatus.UNPAID
          }
        });

        await tx.payment.update({
          where: {
            id: paymentId
          },
          data: {
            stripeEventId: event.id,
            status: session.payment_status === 'paid' ? PaymentStatus.PAID : PaymentStatus.UNPAID,
            paymentGatewayData: session as any
          }
        });
      });

      console.log(`Payment processed successfully for appointment ${appointmentId}`);
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object
      console.log(`Checkout session ${session.id} expired`)
      break
    }
    case "payment_intent.payment_failed": {
      const session = event.data.object

      console.log(`Payment intent ${session.id} failed`);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
      return { message: `Unhandled event type ${event.type}` }
  }

  return { message: `Webhook Event ${event.id} processed successfully` }
}


export const paymentService = {
  handleStripeWebhookEvent
}