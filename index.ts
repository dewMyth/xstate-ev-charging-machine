import { createMachine, assign, createActor } from "xstate";
const readline = require("node:readline"); // To Enable a user interactive terminal - https://nodejs.org/api/readline.html

// Random Authorizer Function - 50% chance of Authorization Success
import { randomAuthorizer } from "./helper";

import { STATES, TRANSITIONS } from "./constants";

const getRandomAuthStateToPersist = randomAuthorizer();

if (!getRandomAuthStateToPersist) {
  console.log("*****************************************");
  console.log(
    "NOTE: Please re-start the EV Application if you want to get the Random Authorized State to TRUE"
  );
  console.log("*****************************************");
}
// Create a readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Passing the state as an optional argument to persist the state on next recursive call
 * Otherwise, the state will be reset to "Idle" on every recursive call if the initial state is hardcoded
 * on createMachine function.
 */

const evChargingMachineApp = (state?) => {
  // Initial State keeeping to persist
  let initialState: STATES = state || STATES.Idle;

  rl.question(
    `
    ================ EV Charging Machine is in ${initialState.toUpperCase()} mode ================
    Press following buttons to test the EV Charging Machine:
    \n 1. Press "a" to Attempt Authorization
    \n 2. Press "f" to Simulate failed Authorization
    \n 3. Press "s" to Begin preparations for the Charging process
    \n 4. Press "c" to Start Charging Process
    \n 5. Press "t" to Stop the Charging Process
    \n 6. Press "r" to Reset the EV Charging Machine
    \n 7. Press "q" to Exit the EV Charging Machine
    \n    ================ EV Charging Machine ================
    \n`,
    (answer) => {
      const evChargingMachine = createMachine({
        /** @xstate-layout N4IgpgJg5mDOIC5RgG4GEAWBDATlAlgHZQB0AkhADZgDEAygCoCCASgwPpoASrA4mQDleAbQAMAXUSgADgHtY+AC75ZhKSAAeiAEzbRJAJwA2ABwB2ACyXRFk6NEBmADQgAnogsBWCyU-HtBiYAjEHGQWaeAL6RLqiYuATE5FS0TAwMAKIAsgAKHEwAqgxcAPIsZABaaWQlAmKSSCByCsqq6loIuvrG5lYWNnaOLu4IDtpGJHoOonYOBqKeRmY20bHo2HhEpBTUNGmZuflFpeVVDDV1QQ0y8koqao0dXYamlta29s5uiKFmJHaBTwOEyLCKiIImVbgdYJLbJXaFYplSrVWrsABiTDIABkMgARerqZp3NqPHR6F69d6DL4jILg-6giwOMEWAzeMxQuIbRKkJgAV0UGFkOHwAC9IDRuHxBLx2IxWJkCRIibdWg9QB0grY-kFFmNREY9PNtCZhogHCESCEDJZpkYjGz7EYuTDNkkBUKReKsOr0Vh8NQIHt0tk8uxEScUedaoTGsT1e1ELa-toIWYDEEHEZ7Hqzd8EBDtCQzONPNogSzmbaLK74u6+YLhaKxb77v7A5L9mGjkjTqjLtcmmr7kmEH4DCRRAYWUYZyZtP18yNgiQ2QZAlZxsCQkE6zy4XRFLhlMQaAAhDL8AScHgsa8iFXxkekzU-ExGTwlz-LbQZufBOaCDVr4QQBDmGaeN4Ni1jE0L1ryJAIVs9AMCUOS3jKQhxjcLSjmSnS6EEU56ssW62IEQEgZ4YHGKIkHQRYsFwYQsgQHA6jcrCxCqnhr6aIgAC0RhAcJ+7cdsKS8SSGoCcB2hUaaJBLKaDj9OE4Tli6cFcQ2JCes24qQNJiYEVmSnpp4ZhjEERj0hWQGWvoJgWEaH7atZH7eOJekGd6rZ+gGQYmfhb4IKYk4GAEZihJ45hgcyQFFmuQLTrYYxGA4cUOD5iFHieWwhfxWrLBM-7skCUUQvRVFzJMcyeI45iOtmH65XCyE8c+fGyU8hrFjYc5WQa07Lh4dXaA1oILI4RrtUkR6yNI0jGd1MljouVqvIsVnMq1Fi1ZOk3sk1ZgtaY2nREAA */
        id: "evCharging",
        initial: initialState,
        context: {
          message: "", // Log Message to be displayed in the terminal as log
          type: "", // To get the Transition type to display in the terminal as log
          authorized: getRandomAuthStateToPersist,
        },
        states: {
          [STATES.Idle]: {
            entry: assign({
              message: "Please plug in your Vehicle to Charge!",
            }),
            // To test the state transition
            on: {
              ATTEMPT_AUTHORIZATION: [
                {
                  guard: (value) => value.context.authorized,
                  target: [STATES.Authorized],
                  actions: assign({
                    type: TRANSITIONS.ATTEMPT_AUTHORIZATION,
                  }),
                },
                {
                  guard: (value) => !value.context.authorized,
                  target: [STATES.AuthorizationFailed],
                  actions: assign({
                    type: TRANSITIONS.ATTEMPT_AUTHORIZATION,
                  }),
                },
              ],
              // Simulate Authorization Failed
              AUTHORIZATION_FAILED: {
                target: [STATES.AuthorizationFailed],
                actions: assign({
                  type: TRANSITIONS.AUTHORIZATION_FAILED,
                }),
              },
            },
          },
          [STATES.Authorized]: {
            entry: assign({
              message:
                "Vehicle Authorized! Please plug in your Vehicle to Charge!",
            }),
            on: {
              CHARGING_STARTED: {
                target: [STATES.Starting],
                actions: assign({
                  type: TRANSITIONS.CHARGING_STARTED,
                }),
              },
              RESET: {
                target: [STATES.Idle],
                actions: assign({
                  type: TRANSITIONS.RESET,
                }),
              },
            },
          },
          [STATES.AuthorizationFailed]: {
            entry: assign({
              message:
                "Vehicle Authorization Failed! Please try again or Contact Support team!",
            }),
            on: {
              ATTEMPT_AUTHORIZATION: [
                {
                  guard: (value) => value.context.authorized,
                  target: [STATES.Authorized],
                  actions: assign({
                    type: TRANSITIONS.ATTEMPT_AUTHORIZATION,
                  }),
                },
                {
                  guard: (value) => !value.context.authorized,
                  target: [STATES.AuthorizationFailed],
                  actions: assign({
                    type: TRANSITIONS.ATTEMPT_AUTHORIZATION,
                  }),
                },
              ],
              RESET: {
                target: [STATES.Idle],
                actions: assign({
                  type: TRANSITIONS.RESET,
                }),
              },
            },
          },
          [STATES.Starting]: {
            entry: assign({
              message: "Preparing the Charging Process",
            }),
            on: {
              BEGIN_CHARGING: {
                target: [STATES.Charging],
                actions: assign({
                  type: TRANSITIONS.BEGIN_CHARGING,
                }),
              },
              RESET: {
                target: [STATES.Idle],
                actions: assign({
                  type: TRANSITIONS.RESET,
                }),
              },
            },
          },
          [STATES.Charging]: {
            entry: assign({
              message: "Charging in Progress!",
            }),
            on: {
              STOP_CHARGING: {
                target: [STATES.Stopped],
                actions: assign({
                  type: TRANSITIONS.STOP_CHARGING,
                }),
              },
              RESET: {
                target: [STATES.Idle],
                actions: assign({
                  type: TRANSITIONS.RESET,
                }),
              },
            },
          },
          [STATES.Stopped]: {
            entry: assign({
              message: "Charging Stopped!",
            }),
            on: {
              RESET: {
                target: [STATES.Idle],
                actions: assign({
                  type: TRANSITIONS.RESET,
                }),
              },
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
        if (prevState && prevState !== state.value) {
          // Log the current state
          console.log("###############################################");
          console.log(`STATE : Entered ${state.value} state.`);
          console.log(
            `TRANSITION : Transitioned from ${prevState} to ${state.value} on ${state.context.type}.`
          );
          console.log(`Message : ${state.context.message}`);
          console.log("###############################################");
        }
        prevState = state.value;

        if (
          prevState === STATES.Stopped ||
          prevState === STATES.AuthorizationFailed
        ) {
          console.log(
            `Resetting the state to ${STATES.Idle} EV Charging Machine...`
          );
          evChargingActor.send({ type: TRANSITIONS.RESET });
        }
      });

      // Start the Actor
      evChargingActor.start();

      if (answer == "q") {
        console.log("Exiting the EV Charging Machine...");
        rl.close();
        return;
      } else {
        switch (answer) {
          case "a":
            evChargingActor.send({ type: TRANSITIONS.ATTEMPT_AUTHORIZATION });
            break;

          case "f":
            evChargingActor.send({ type: TRANSITIONS.ATTEMPT_AUTHORIZATION });
            break;

          case "s":
            if (state !== STATES.Authorized) {
              console.log("Please Authorized to Start Charging Process...");
            } else {
              evChargingActor.send({ type: TRANSITIONS.CHARGING_STARTED });
            }
            break;

          case "c":
            if (state !== STATES.Starting) {
              console.log(
                `You have to Authorized and be in the ${STATES.Starting} to start ${STATES.Charging}`
              );
            } else {
              evChargingActor.send({ type: TRANSITIONS.BEGIN_CHARGING });
            }

            break;

          case "t":
            if (state !== STATES.Charging) {
              console.log(
                "You have to Start Charging process first to Stop Charging!"
              );
            } else {
              evChargingActor.send({ type: TRANSITIONS.STOP_CHARGING });
            }

            break;

          case "r":
            evChargingActor.send({ type: TRANSITIONS.RESET });
            break;

          default:
            console.log("Invalid key pressed. Try again.");
            break;
        }

        // Passing the current state to persist the state in the next round
        evChargingMachineApp(prevState);
      }
    }
  );
};

evChargingMachineApp();
