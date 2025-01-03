import { createMachine, assign, createActor } from "xstate";

// Define the State Machine for the EV Charging Machine
const evChargingMachine = createMachine({
  id: "evCharging",
  initial: "Idle",
  context: {
    message: "",
  },
  states: {
    Idle: {
      entry: assign({
        message: "Please plug in your Vehicle to Charge!",
      }),
      // To test the state transition
      on: {
        START_CHARGING: "Charging",
      },
    },
    Charging: {
      entry: assign({
        message: "Charging in Progress!",
      }),
      // After 5 seconds, transition to Idle state automatically
      after: {
        5000: "Idle",
      },
    },
  },
});

// Create an Actor for the EV Charging Machine
const evChargingActor = createActor(evChargingMachine);

// Subscribe to the Actor
evChargingActor.subscribe((state) => {
  console.log(state.context.message);
});

// Start the Actor
evChargingActor.start();

// Simulate user evetn to Change the state from Idle to Charging
evChargingActor.send({ type: "START_CHARGING" });
