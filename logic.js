/* 
* Create a new accident
 * @param {car.registrry.accidents.RegisterAccident} newAccident - the new
accident to be registered
 * @transaction
 */
function RegisterAccident(newAccident) {
 // make a new resource containing the information given to the function
 // save this new resource in the registry
 return getAssetRegistry('car.registrry.accidents.Accident')
 .then(function (registry) {
 var factory = getFactory();
 var newAccidentAsset =
 factory.newResource('nl.amis.registry.accidents',
 'Accident', newAccident.accident.accidentId);
 newAccidentAsset = newAccident.accident;
 return registry.add(newAccidentAsset);
 });
}
 /* @param {car.registrry.accidents.AssignToCaseWorker} assignToCaseWorker -
the particular accident that you want to assign to a responsible Case worker
 * @transaction
 */
function AssignToCaseWorker(assignToCaseWorker) {
 if (assignToCaseWorker.accident.status !== 'OPEN')
 throw new Error('Case already assigned to an Case worker.');
 else {
 assignToCaseWorker.accident.status = 'ASSIGNED';
 assignToCaseWorker.accident.assignee = assignToCaseWorker.assignee;
 }

 return getAssetRegistry('nl.amis.registry.accidents.Accident')
 .then(function (assetRegistry) {
 return assetRegistry.update(assignToCaseWorker.accident);
 });
}
/**
 * Send an accident report to one or more insurance companies
 * @param {car.registrry.accidents.SendToInsurance} sendToInsurance - the
particular accident that needs to be sent to one or more insurance companies
 * @transaction
 */
function SendToInsurance(sendToInsurance) {
 var assetRegistry;
 var accident;
 return getAssetRegistry('car.registrry.accidents.Accident')
 .then(function(ar) {
 assetRegistry = ar;
 return assetRegistry.get(sendToInsurance.accidentId);
 })
 .then(function(acc){
 accident = acc;
 if (accident.status == 'OPEN')
 throw new Error('No case worker has been assigned to the report yet.');
 else if (accident.status == 'SEND_TO_INSURER')
 throw new Error('This case has already been sent to one or moreinsurers.');
 else {
 // update ACCIDENT
 accident.status = 'SEND_TO_INSURER';
 if (!accident.goods.insurers) accident.goods.insurers = [];
 accident.goods.insurers = sendToInsurance.insurers; 
   for (var i = 0, len = accident.goods.insurers.length; i < len; i++)
{
 if (!accident.goods.insurers[i].cases)
accident.goods.insurers[i].cases - [];
 accident.goods.insurers[i].cases.push(accident);
 }

 return assetRegistry.update(accident);
 }
 })
 .then(function() {
 return getAssetRegistry('nl.amis.registry.companies.InsuranceCompany')
 })
 .then(function(assetRegistry) {
 return assetRegistry.updateAll(accident.goods.insurers);
 });
}
 /* Update status when accident is resolved
 * @param {car.registrry.accidents.ResolveAccident} resolveAccident - the
particular accident that should be resolved
 * @transaction
 */
function ResolveAccident(resolveAccident) {
 var assetRegistry;
 return getAssetRegistry('car.registrry.accidents.Accident')
 .then(function(ar) {
 assetRegistry = ar;
 return assetRegistry.get(resolveAccident.accidentId);
 })
 .then(function(accident){
 if (accident.status == 'RESOLVED')
 throw new Error('Case is already resolved.');
 if (accident.status !== 'SEND_TO_INSURER')
 throw new Error('Case report not yet sent to insurer(s).');
 else
 accident.status = 'RESOLVED';

 return assetRegistry.update(accident);
 });
}


