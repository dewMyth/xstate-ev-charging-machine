import { createMachine, assign, createActor } from "xstate";
const readline = require("node:readline"); // To Enable a user interactive terminal - https://nodejs.org/api/readline.html

// Random Authorizer Function - 50% chance of Authorization Success
import { randomAuthorizer } from "./helper";

import { STATES, TRANSITIONS } from "./constants";

/** Save the Random Authroized state in a higher level constant variable
 * to keep Authorization State in a persist manner.
 */
const getRandomAuthStateToPersist = randomAuthorizer();

if (!getRandomAuthStateToPersist) {
  console.log("*****************************************");
  console.log(
    "NOTE: Please Restart the Application to Change the Random Authorization Status"
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
        /** @xstate-layout N4IgpgJg5mDOIC5RgG4GEAWBDATlAlgHZQB0AkhADZgDEAggCoMCiAsgAoMD6dAqgwAkA8gCUyALUZkhAOQDaABgC6iUAAcA9rHwAXfBsKqQAD0QBWABwkFAdgsBGACwWAnAscBmGy8cAmADQgAJ6IAGw29iQ2oWY2CmaWdr5mLgC+qYGomLgExORUtIwsHNx8gqISUrJy9ipIIJraegZGpgh+gSEIsWYkDr6OLi5eoZ6O6Zno2HhEpBTU9PzCYpIM0jJcAGJ0ZAAyzAAiinXqWrr6hvVt9vYKJKEKwy72DxYRZo72nYiO3n0pHlCowszl8MQm4CmOVmJDoAFcdBgNDh8AAvSA0NACOgiADiZBkuK4AGUGDiWEdlEZGucWldEPZfB4on4Bg5HkDfh5vggbhY7qEBi4zPYIh5HGYPBCstNcqR4YjkWiMSJmMTmAxjtSzs1LqBrjYbFEYqMXAMPIDQi4bDzbiD7hEHBYLL57CCzKFpVCZnkFUiUaisLrNlh8NQIPQmGxODwlhVVustfUabrWuYrLYXb5swMXh4XY4eb4bMzHApBSXfLYzRKvdkffKEf60UGLiGwxiitHSnGVlV5LVtU0Lmn2r5rApJ5aUq5s6FbYaSBKPE4FCvQiu4hY67KYX6lYHg6HwzRVerNVTkzqR-TeYvoh7BubLdaeQ4SGZJ5ObH5fhyzDu0J5MSOi4HoxA0AAQsw+IbFiOKwbiSanMOdL6gyHi9H4bpWi6bqOKatrOMya6MiKVair8gENiQIFgbMp5qhqyENNeaEmAy94mk+ngvjawQYW81h2HyK4KPYHg+NRcokPWco0KSQjsFw8F4gSSGXihtJ6hxvL5iQc6xPYkogq4sQLhYWFeGWZafr8vjSTCckMWezGaaxqE6QaRoPqaz5Aq+Am8qErhLiCxY3JYFijOMGSQs5wE6BoahqCqTEXicHnaaOoo+dxNYWgF-FdG8Vium8yQfIMniehChAaBAcBGDKQFQEO2W3gAtPOQXdY5eTzGA7WprexmRLEDgpL40UehJhZBYa46Og+xkuMC25xS1NH7gGkDDTe6G8iKH4ie4vhrTY2bDLa03jSJsQ1iCzj9Y2ioBq2BjtuG+3sdcHjjhYmHCmMrqjGCPLWSQQNlg8QySvYwovbRoE4OBbVXp5OXHRNuWhC8n4-mYtqWMyLggmJhqYVaaSbd6MkJejWkjYdY0neyfgXVd3JBW60VQ24BGAjmPg05MDPI8lqUQD9XkMtjp0c+EXM8taLgkKKbqWDVCT2Ok6RAA */
        id: "evCharging",
        initial: initialState,
        context: {
          message: "", // Log Message to be displayed in the terminal as log
          type: "", // To get the Transition type to display in the terminal as log
          authorized: getRandomAuthStateToPersist,
        },
        states: {
          Idle: {
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
          Authorized: {
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
          AuthorizationFailed: {
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
          Starting: {
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
          Charging: {
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
          Stopped: {
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
        // Show only if a TRANSITION is actually happened, i.e history state and the current state of the recusion should not be equal
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

        /**  Automatically Reset the state to Idle if the state change to `Stopped` (So user can start new process) or
         *   `AuthorizationFailed`(So user can attaempt another authrization)
         */
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
              console.log("###############################################");
              console.log("Please Authorized to Start Charging Process...");
              console.log("###############################################");
            } else {
              evChargingActor.send({ type: TRANSITIONS.CHARGING_STARTED });
            }
            break;

          case "c":
            if (state !== STATES.Starting) {
              console.log(
                "##################################################################"
              );
              console.log(
                `You have to Authorized and be in the ${STATES.Starting} to start ${STATES.Charging}`
              );
              console.log(
                "##################################################################"
              );
            } else {
              evChargingActor.send({ type: TRANSITIONS.BEGIN_CHARGING });
            }

            break;

          case "t":
            if (state !== STATES.Charging) {
              console.log(
                "##################################################################"
              );
              console.log(
                "You have to Start Charging process first to Stop Charging!"
              );
              console.log(
                "##################################################################"
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

// Start the Application
evChargingMachineApp();
