const axios = require ('axios'); axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
const faker = require ('faker');

function paymentretrieval (task, complete)
{
  const { workflowInstanceKey, bpmnProcessId, elementId } = task;
  switch (elementId) {
  case 'generate':
    generate (task, complete);
    break;
  case 'charge-card':
    charge (task, complete);
    break;
  case 'charge-card-premium':
    chargepremium (task, complete);
    break;
  default:
    {
      console.log('Unknown activityId in process ' + bpmnProcessId + ' (' + elementId + ')');
      complete.failure('Unknown activetyId in process ' + bpmnProcessId + ' (' + elementId + ')', 0);
    }
  }
};

module.exports = {paymentretrieval};

function charge(task, complete) {
  const {workflowInstanceKey} = task;

  const amount = task.variables.amount;
  const item = task.variables.item;
  console.log(`Charging credit card with an amount of ${amount}€ for the item '${item}' ` + ' Process :' + workflowInstanceKey.toString() );
  complete.success();
};

function chargepremium(task, complete) {
  const {workflowInstanceKey} = task;

  const amount = task.variables.amount;
  const item = task.variables.item;
  console.log(`Premium charging credit card with an amount of ${amount}€ for the item '${item}' ` + ' Process :' + workflowInstanceKey.toString() );
  complete.success();
};

function generate(task, complete) {
  const { workflowInstanceKey } = task;

  console.log(`Generating amount and item for Process ` + workflowInstanceKey.toString());
  complete.success({ 
      amount: Number(faker.fake('{{finance.amount}}')),
      item: faker.fake('{{commerce.product}}')
  });
};
