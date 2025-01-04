export enum STATES {
  Idle = "Idle",
  Authorized = "Authorized",
  AuthorizationFailed = "AuthorizationFailed",
  Starting = "Starting",
  Charging = "Charging",
  Stopped = "Stopped",
}

export enum TRANSITIONS {
  ATTEMPT_AUTHORIZATION = "ATTEMPT_AUTHORIZATION",
  AUTHORIZATION_FAILED = "AUTHORIZATION_FAILED",
  CHARGING_STARTED = "CHARGING_STARTED",
  BEGIN_CHARGING = "BEGIN_CHARGING",
  STOP_CHARGING = "STOP_CHARGING",
  RESET = "RESET",
}
