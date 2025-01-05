export const randomAuthorizer = () => {
  const random0to1Value = Math.random();
  const authorizationStatus = random0to1Value > 0.5 ? true : false;
  console.log("Random Authorization Status : ", authorizationStatus);
  return authorizationStatus;
};
