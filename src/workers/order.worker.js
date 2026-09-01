import "dotenv/config";
import { connectRabbitMQ } from "../messaging/rabbitmq.js";

const QUEUE_NAME = "order.created";

async function startWorker() {
  const channel = await connectRabbitMQ();

  await channel.assertQueue(QUEUE_NAME, {
    durable: true
  });

  console.log(
    `Order worker is waiting for messages from "${QUEUE_NAME}"`
  );

  channel.consume(
    QUEUE_NAME,
    async (message) => {
      if (!message) {
        return;
      }

      try {
        const event = JSON.parse(
          message.content.toString()
        );

        console.log("Processing order event:");
        console.log(
          JSON.stringify(event, null, 2)
        );

        // Simulate background work
        await new Promise((resolve) =>
          setTimeout(resolve, 500)
        );

        console.log(
          `Order ${event.data.order_id} processed successfully`
        );

        channel.ack(message);
      } catch (error) {
        console.error(
          "Order worker failed:",
          error.message
        );

        // Reject bad message and do not requeue forever
        channel.nack(
          message,
          false,
          false
        );
      }
    },
    {
      noAck: false
    }
  );
}

startWorker().catch((error) => {
  console.error(
    "Order worker could not start:",
    error.message
  );

  process.exit(1);
});