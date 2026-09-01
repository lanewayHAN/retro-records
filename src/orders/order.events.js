import { randomUUID } from "crypto";
import { publishMessage } from "../messaging/rabbitmq.js";

const ORDER_CREATED_QUEUE = "order.created";

export async function publishOrderCreated(order) {
  const event = {
    event_id: randomUUID(),
    event_type: "order.created",
    occurred_at: new Date().toISOString(),

    data: {
      order_id: order.order_id,
      customer_id: order.customer_id,
      created_by: order.created_by,
      product_id: order.product_id,
      quantity: order.quantity,
      status: order.status,
      total_amount: order.total_amount
    }
  };

  if (process.env.NODE_ENV === "test") {
    return {
      ...event,
      skipped: true
    };
  }

  await publishMessage(
    ORDER_CREATED_QUEUE,
    event
  );

  return event;
}