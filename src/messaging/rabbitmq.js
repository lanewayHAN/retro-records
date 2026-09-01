import amqp from "amqplib";

let connection;
let channel;

export async function connectRabbitMQ() {
  if (connection && channel) {
    return channel;
  }

  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);

    connection.on("error", (error) => {
      console.error("RabbitMQ connection error:", error.message);
    });

    connection.on("close", () => {
      console.log("RabbitMQ connection closed");
      connection = undefined;
      channel = undefined;
    });

    channel = await connection.createChannel();

    console.log("RabbitMQ connected successfully");

    return channel;
  } catch (error) {
    connection = undefined;
    channel = undefined;

    console.error(
      "RabbitMQ connection failed:",
      error.message
    );

    throw error;
  }
}

export async function publishMessage(queueName, message) {
  const rabbitChannel = await connectRabbitMQ();

  await rabbitChannel.assertQueue(queueName, {
    durable: true
  });

  const messageBuffer = Buffer.from(
    JSON.stringify(message)
  );

  rabbitChannel.sendToQueue(
    queueName,
    messageBuffer,
    {
      persistent: true
    }
  );

  return true;
}

export async function checkRabbitMQ() {
  try {
    const rabbitChannel = await connectRabbitMQ();

    if (!rabbitChannel) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function closeRabbitMQ() {
  try {
    if (channel) {
      await channel.close();
    }

    if (connection) {
      await connection.close();
    }
  } finally {
    channel = undefined;
    connection = undefined;
  }
}