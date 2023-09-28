const User = require('../models/authModel');
const { StatusCodes } = require('http-status-codes');

const planCheck = async (req, res, next) => {
  const { id } = req.user;
  console.log(id);

  try {
    const user = await User.findById(id);
    console.log(`The Plan id is ${user.plan.planId}`);
    if (user.plan.planId) {
      const timeDifference = Date.now() - user.plan.planUpdtae.getTime();
      console.log(`The time difference is ${timeDifference}`);
      const planDuration = Math.floor(timeDifference / (1000*60*60*24));
      console.log(planDuration);
      console.log(user.plan.planUpdtae);

      if (planDuration >= 30) {
        const planUpdate = await User.findOneAndUpdate({ _id: id }, { $set: { 'plan.planId': null } });
        const updateClickTime=await User.findOneAndUpdate({_id:id}, {$set:{botClickTime:null}})
        
      }
    }

    next();
  } catch (error) {
    // Handle error appropriately, e.g., send error response or take appropriate actions
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Internal Server Error');
  }
};

module.exports = planCheck;
