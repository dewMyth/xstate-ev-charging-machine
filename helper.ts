export const randomAuthorizer = () => {
  const randomNumberBetween0to10 = Math.floor(Math.random() * 10);
  const authorizationStatus = randomNumberBetween0to10 > 5 ? true : false;
  console.log("Authorization Status: ", authorizationStatus);
  return authorizationStatus;
};
