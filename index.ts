import { createMachine, assign, createActor } from "xstate";

// Define the State Machine for the EV Charging Machine
const evChargingMachine = createMachine({
  id: "evCharging",
  initial: "Idle",
  context: {
    message: "",
    type: "",
  },
  states: {
    Idle: {
      entry: assign({
        message: "Please plug in your Vehicle to Charge!",
      }),
      // To test the state transition
      on: {
        START_CHARGING: {
          target: "Charging",
          actions: assign({
            type: "START_CHARGING",
          }),
        },
        ATTEMPT_AUTHORIZATION: {
          target: "Authorized",
          actions: assign({
            type: "ATTEMPT_AUTHORIZATION",
          }),
        },
      },
    },
    Authorized: {
      entry: assign({
        message: "Vehicle Authorized! Please plug in your Vehicle to Charge!",
      }),
      on: {
        AUTHORIZATION_SUCCESS: {
          target: "Starting",
          actions: assign({
            type: "AUTHORIZATION_SUCCESS",
          }),
        },
        AUTHORIZATION_FAILED: {
          target: "AuthorizationFailed",
          actions: assign({
            type: "AUTHORIZATION_FAILED",
          }),
        },
      },
    },
    AuthorizationFailed: {
      entry: assign({
        message:
          "Vehicle Authorization Failed! Please try again or Contact Support team!",
      }),
    },
    Starting: {
      entry: assign({
        message: "Preparing the Charging Process",
      }),
      on: {
        CHARGING_STARTED: {
          target: "Charging",
          actions: assign({
            type: "CHARGING_STARTED",
          }),
        },
      },
    },
    Charging: {
      entry: assign({
        message: "Charging in Progress!",
      }),
      // After 5 seconds, transition to Idle state automatically
      after: {
        5000: "Stopped",
      },
    },
    Stopped: {
      entry: assign({
        message: "Charging Stopped!",
      }),
      after: {
        2000: "Idle",
      },
    },
  },
});

// Create an Actor for the EV Charging Machine
const evChargingActor = createActor(evChargingMachine);

// Variable to Store the history of the State
let prevState: any = null;

// Subscribe to the Actor
evChargingActor.subscribe((state) => {
  // Log the current state
  console.log("====================================");
  console.log(`Entered ${state.value} state. `);

  if (prevState) {
    console.log(
      `Transitioned from ${prevState} to ${state.value} on ${state.context.type}.`
    );
  }
  prevState = state.value;
  console.log(state.context.message);
  console.log("====================================");
});

// Start the Actor
evChargingActor.start();

// Simulate user evetn to Change the state from Idle to Charging
// evChargingActor.send({ type: "START_CHARGING" });
evChargingActor.send({ type: "ATTEMPT_AUTHORIZATION" });
// evChargingActor.send({ type: "AUTHORIZATION_FAILED" });
evChargingActor.send({ type: "AUTHORIZATION_SUCCESS" });
evChargingActor.send({ type: "CHARGING_STARTED" });
