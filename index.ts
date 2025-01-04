import { createMachine, assign, createActor } from "xstate";
const readline = require("node:readline"); // To Enable a user interactive terminal - https://nodejs.org/api/readline.html

import { randomAuthorizer } from "./helper";

// Create a readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Sample Interactive Terminal
// const runRecursively = () => {
//   rl.question("What do you think of Node.js? ", (answer) => {
//     if (answer === "exit") {
//       rl.close();
//       return;
//     } else {
//       runRecursively();
//     }
//   });
// };

// console.log(runRecursively());

const evChargingMachineApp = (state?) => {
  let initialState = state || "Idle";

  rl.question(
    `Press following buttons to test the EV Charging Machine:
    \n 1. Press "a" to Attempt Authorization
    \n 2. Press "f" to Simulate failed Authorization
    \n 3. Press "s" to Begin preparations for the Charging process
    \n 4. Press "c" to Start Charging Process
    \n 5. Press "t" to Stop the Charging Process
    \n 6. Press "r" to Reset the EV Charging Machine
    \n 7. Press "q" to Exit the EV Charging Machine
    \n`,
    (answer) => {
      const evChargingMachine = createMachine({
        /** @xstate-layout N4IgpgJg5mDOIC5RgG4GEAWBDATlAlgHZQB0AkhADZgDEAygCoCCASgwPpoASrA4mQDleAbQAMAXUSgADgHtY+AC75ZhKSAAeiAEzbRJAJwA2ABwB2ACyXRFk6NEBmADQgAnogsBWCyU-HtBiYAjEHGQWaeAL6RLqiYuATE5FS0TAwMAKIAsgAKHEwAqgxcAPIsZABaaWQlAmKSSCByCsqq6loIuvrG5lYWNnaOLu4IDtpGJHoOonYOBqKeRmY20bHo2HhEpBTUNGmZuflFpeVVDDV1QQ0y8koqao0dXYamlta29s5uiKFmJHaBTwOEyLCKiIImVbgdYJLbJXaFYplSrVWrsABiTDIABkMgARerqZp3NqPHR6F69d6DL4jILg-6giwOMEWAzeMxQuIbRKkJgAV0UGFkOHwAC9IDRuHxBLx2IxWJkCRIibdWg9QB0grY-kFFmNREY9PNtCZhogHCESCEDJZpkYjGz7EYuTDNkkBUKReKsOr0Vh8NQIHt0tk8uxEScUedaoTGsT1e1ELa-toIWYDEEHEZ7Hqzd8EBDtCQzONPNogSzmbaLK74u6+YLhaKxb77v7A5L9mGjkjTqjLtcmmr7kmEH4DCRRAYWUYZyZtP18yNgiQ2QZAlZxsCQkE6zy4XRFLhlMQaAAhDL8AScHgsa8iFXxkekzU-ExGTwlz-LbQZufBOaCDVr4QQBDmGaeN4Ni1jE0L1ryJAIVs9AMCUOS3jKQhxjcLSjmSnS6EEU56ssW62IEQEgZ4YHGKIkHQRYsFwYQsgQHA6jcrCxCqnhr6aIgAC0RhAcJ+7cdsKS8SSGoCcB2hUaaJBLKaDj9OE4Tli6cFcQ2JCes24qQNJiYEVmSnpp4ZhjEERj0hWQGWvoJgWEaH7atZH7eOJekGd6rZ+gGQYmfhb4IKYk4GAEZihJ45hgcyQFFmuQLTrYYxGA4cUOD5iFHieWwhfxWrLBM-7skCUUQvRVFzJMcyeI45iOtmH65XCyE8c+fGyU8hrFjYc5WQa07Lh4dXaA1oILI4RrtUkR6yNI0jGd1MljouVqvIsVnMq1Fi1ZOk3sk1ZgtaY2nREAA */
        id: "evCharging",
        initial: initialState,
        context: {
          message: "",
          type: "",
          authorized: randomAuthorizer(),
        },
        states: {
          Idle: {
            entry: assign({
              message: "Please plug in your Vehicle to Charge!",
            }),
            // To test the state transition
            on: {
              START_CHARGING: {
                target: "Starting",
                actions: assign({
                  type: "START_CHARGING",
                }),
              },
              ATTEMPT_AUTHORIZATION: [
                {
                  guard: (value) => value.context.authorized,
                  target: "Authorized",
                  actions: assign({
                    type: "ATTEMPT_AUTHORIZATION",
                  }),
                },
                {
                  guard: (value) => !value.context.authorized,
                  target: "AuthorizationFailed",
                  actions: assign({
                    type: "ATTEMPT_AUTHORIZATION",
                  }),
                },
              ],
              // Simulate Authorization Failed
              AUTHORIZATION_FAILED: {
                target: "AuthorizationFailed",
                actions: assign({
                  type: "AUTHORIZATION_FAILED",
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
                target: "Starting",
                actions: assign({
                  type: "CHARGING_STARTED",
                }),
              },
              RESET: {
                target: "Idle",
                actions: assign({
                  type: "RESET",
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
                  target: "Authorized",
                  actions: assign({
                    type: "ATTEMPT_AUTHORIZATION",
                  }),
                },
                {
                  guard: (value) => !value.context.authorized,
                  target: "AuthorizationFailed",
                  actions: assign({
                    type: "ATTEMPT_AUTHORIZATION",
                  }),
                },
              ],
              RESET: {
                target: "Idle",
                actions: assign({
                  type: "RESET",
                }),
              },
            },
            after: {
              2000: "Idle",
            },
          },
          Starting: {
            entry: assign({
              message: "Preparing the Charging Process",
            }),
            on: {
              BEGIN_CHARGING: {
                target: "Charging",
                actions: assign({
                  type: "BEGIN_CHARGING",
                }),
              },
              RESET: {
                target: "Idle",
                actions: assign({
                  type: "RESET",
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
                target: "Stopped",
                actions: assign({
                  type: "STOP_CHARGING",
                }),
              },
              RESET: {
                target: "Idle",
                actions: assign({
                  type: "RESET",
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
                target: "Idle",
                actions: assign({
                  type: "RESET",
                }),
              },
            },
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
        console.log(`Entered ${state.value} state.`);

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

      if (answer == "q") {
        console.log("Exiting the EV Charging Machine...");
        rl.close();
        return;
      } else {
        switch (answer) {
          case "a":
            evChargingActor.send({ type: "ATTEMPT_AUTHORIZATION" });
            break;

          case "f":
            evChargingActor.send({ type: "AUTHORIZATION_FAILED" });
            break;

          case "s":
            evChargingActor.send({ type: "CHARGING_STARTED" });
            break;

          case "c":
            evChargingActor.send({ type: "BEGIN_CHARGING" });
            break;

          case "t":
            evChargingActor.send({ type: "STOP_CHARGING" });
            break;

          case "r":
            evChargingActor.send({ type: "RESET" });
            break;

          default:
            console.log("Invalid key pressed. Try again.");
            break;
        }

        evChargingMachineApp(prevState);
      }
    }
  );
};

evChargingMachineApp();
