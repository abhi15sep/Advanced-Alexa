/* eslint-disable  func-names */
/* eslint-disable  no-console */
//Makerdemy crypto helper skill
//This code sample demonstrates handing intents using Alexa Skills Kit SDK(v2)

//The information about the top cryptocurrencies
const INFO = [
["BTC","Bitcoin is a digital currency created in 2009 by a mysterious figure using the alias Satoshi Nakamoto. It can be used to buy or sell items from people and companies that accept bitcoin as payment"],
["ETH","Ether is used broadly for two purposes: it is traded as a digital currency exchange like other cryptocurrencies and is used inside Ethereum to run applications and even to monetize work"],
["XRP","Ripple is a peer-to-peer powered cryptocurrency designed to work seamlessly with the Internet to allow a fast, direct and secure way to send payments on the web. "],
["BCH","Bitcoin Cash is an altcoin version of the popular Bitcoin cryptocurrency. Bitcoin Cash is the result of a hard fork in blockchain technology "],
["LTC","Litecoin is a peer-to-peer cryptocurrency. Creation and transfer of coins is based on an open source cryptographic protocol and is not managed by any central authority"],
["USDT","Tether is a blockchain-based cryptocurrency whose cryptocoins in circulation are backed by an equivalent amount of traditional fiat currencies, like the dollar, the euro or the Japanese yen, which are held in a designated bank account "],
["EOS"," EOS.IO uses blockchain architecture that is built to enable vertical and horizontal scaling of decentralized applications. The EOS token is the cryptocurrency of the EOS network."],
["BNB","Binance coin is a digital currency issued by the cryptocurrency exchange Binance. The cryptocurrency is denoted by the symbol BNB. It is based on the Ethereum blockchain and similar to Ether"],
["BSV","BSV is a cryptocurrency created as a result of Bitcoin Cash hard fork, BSV currency is now supported by major cryptocurrency exchanges."],
["XMR","XMR is an open-source cryptocurrency created in April 2014 that focuses on fungibility, privacy and decentralization."],
["ADA","Cardano is home to the Ada cryptocurrency, which can be used to send and receive digital funds. This digital cash represents the future of money, making possible fast, direct transfers that are guaranteed to be secure through the use of cryptography. "],
["XLM","The cryptocurrency, originally known as stellar, was later called Lumens or XLM works as a decentralized payment network and protocol with a native currency "],
["LEO","LEOcoin is a well-known cryptocurrency that trades using the ticker symbol LEO . It uses the Scrypt algorithm and Proof of Work for mining new coins, similar to Bitcoin mining"],
["TRX","Tron (TRX) is a blockchain platform launched as the foundation for a decentralized entertainment ecosystem"],
["HT","Huobi is a Singapore-based cryptocurrency exchange"],
];


//we use ask-sdk standard version
const Alexa = require('ask-sdk');

//To get the market changes of the top five cryptocurrencies
const checkmarketintenthandler = 
{
   canHandle(handlerInput) 
   {
       const request = handlerInput.requestEnvelope.request;
       return request.type === 'IntentRequest' && request.intent.name === 'checkmarketintent' ;
   },
   async handle(handlerInput) {
       const request = handlerInput.requestEnvelope.request;
       const responseBuilder = handlerInput.responseBuilder;
       const market = handlerInput.requestEnvelope.request.intent.slots.market.value;
       let say = market;
       
       //we call the function for checking whether there is a match from the dynamic entities
       let slotValues = getDynamicSlotValues(request.intent.slots);
       let marketid = slotValues.market.resolvedid;
       let resolvedmarket = slotValues.market.resolved;
       
       //No match in the dyanmic entities
       if( (slotValues.market.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.market.heardAs) )
       {
        say = "Please repeat for what cryptocurrency are you checking for, or ask me for help";
         return responseBuilder
           .speak(say)
           .reprompt(say)
           .getResponse();
       }
       
       //match in the dynamic entities
       else
       {
          //make the api call to the coinmarket service
          await getRemoteData('https://api.coinmarketcap.com/v1/ticker/?limit=15')
         .then((response) => 
         {
            const data = JSON.parse(response);
            var newtest = [];
            var originaltest = [];
            var currencyname = [];
            for(var i=0;i<15;i++)
            {
                
                originaltest.push(parseFloat(data[i].percent_change_24h));
             
            //if the percent change is negative, replace "-" with " "
               if(data[i].percent_change_24h < 0) 
               {
               
                  newtest.push(parseFloat(data[i].percent_change_24h.replace("-"," ")));
                  currencyname.push(data[i].name);
                }
            //else just push into the data
                else
                {
                   newtest.push(parseFloat(data[i].percent_change_24h));
                   currencyname.push(data[i].name);
                }
           }
           
       
        
        //with the names and percent chanages, create a dictionary and store it in result
        var result = {};
        currencyname.forEach((key, i) => result[key] = newtest[i]);
        
        //sort the percent changes
        newtest.sort(function(a,b){return b-a});
       
        //sorting the dictionary
        var finalresult = Object.keys(result).map(function(key) {
            return [key, result[key]];
         });
         finalresult.sort(function(first, second) {
             return second[1] - first[1];
        });
       
        for(var i2=0; i2<15;i2++)
        {
          
        }
         var value;
         var k;
         
         //checking the user requested crytocurrency with the top five market changes
         for(k=0;k<15;k++)
         {
           if(resolvedmarket === finalresult[k][0])
           {
             var result1 = finalresult[k][1];
           }
         }
        
           for(k=0;k<15;k++)
           {
            //if percent change is positive value, up
               if(result1 === originaltest[k])
               {
                  value = "up";
               }
             //if the percent change is negative, then down
              else if(result1 === Math.abs(originaltest[k]))
              {
                 value = "down";
              }
           }
          
        say = `${resolvedmarket} is ${value} by ${result1} percent. Now if you want to know the other cryptocurrencies market change or rank or price,
        just say the command followed by the cryptocurrency namey`;
        
      })
      //To catch the error
      .catch((err) => {
        
        say = err.message;
      });
    
    }
        
         return responseBuilder
           .speak(say)
           .reprompt(say)
           .getResponse();
  
   },
};



//Launch Request, responsible for giving different responses for each time the user launches the skill
const LaunchRequestHandler = {
  async canHandle(handlerInput) 
  {
    const attributes = await handlerInput.attributesManager.getPersistentAttributes() || {};
    
    //if the user uses the skill for first time
    if((Object.keys(attributes).length === 0))
    {
      return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    }
    
    //if the user uses the skill for second time
    else if(attributes.name && attributes.count === 0)
    {
       let username = attributes.name.toString();
       //If already user name exists, then we will return the launch request and username
       return handlerInput.requestEnvelope.request.type === 'LaunchRequest' && username;
    }
    
    //when user uses the skill more than 2times
     else if(attributes.name && attributes.count > 0)
    {
        console.log(attributes.count);
       let username = attributes.name.toString();
       //If already user name exists, then we will return the launch request and username
       return handlerInput.requestEnvelope.request.type === 'LaunchRequest' && username && attributes.count;
    }
  },
  async handle(handlerInput)
  {
       const attributes = await handlerInput.attributesManager.getPersistentAttributes() || {};
       var speechText;
      if((Object.keys(attributes).length === 0))
       { 
           speechText = `Welcome to the Cryptocurrency Helper, we help you in getting the latest information about 
           cryptocurrency. <break time="10ms"/>Before moving on,May I know your name?`;
           console.log(speechText);
       }
    
       //If the user uses the skill again
       else
       {
           const attributesManager = handlerInput.attributesManager;
           //getting the name using the persistent attributes 
           const attributes = await attributesManager.getPersistentAttributes() || {};
           attributes.count = 1;
            await attributesManager.savePersistentAttributes();
           console.log(attributes.count);
           attributesManager.setPersistentAttributes(attributes);
           
           let username = attributes.name.toString();
           //making an api call to the coinmarket api service
           await getRemoteData('https://api.coinmarketcap.com/v1/ticker/?limit=15')
           .then((response) => 
           {
                const data = JSON.parse(response);
                
                //Getting the data from the api and using it to show the top five
                //percent changes in cryptocurrency market
                var newtest = [];
                var originaltest = [];
                var currencyname = [];
                for(var i=0;i<15;i++)
                {
                        originaltest.push(parseFloat(data[i].percent_change_24h));
                    if(data[i].percent_change_24h < 0) 
                         {
                                newtest.push(parseFloat(data[i].percent_change_24h.replace("-"," ")));
                                currencyname.push(data[i].name);
                         }
                    else
                         {
                                newtest.push(parseFloat(data[i].percent_change_24h));
                                currencyname.push(data[i].name);
                          }
                }
                var result = {};
                currencyname.forEach((key, i) => result[key] = newtest[i]);
                newtest.sort(function(a,b){return b-a});
                console.log(newtest);
                var finalresult = Object.keys(result).map(function(key) {
                 return [key, result[key]];
                 });
                finalresult.sort(function(first, second) {
                return second[1] - first[1];
                });
      
         speechText = `Welcome back ${username}! Recently ${finalresult[0][0]}, ${finalresult[1][0]},
         ${finalresult[2][0]},${finalresult[3][0]},${finalresult[4][0]} have recorded the top market percent changes.
        If you want to know the clear infomation about these changes, 
        ask me "check, followed by the cryptocurrency name" `;
        
      })
      .catch((err) => {
        
        speechText = err.message;
      });
    
    }
    
    //Dynamic entities Directive
    let replaceEntityDirective = {
         type: 'Dialog.UpdateDynamicEntities',
         updateBehavior: 'REPLACE',
         types: [
           {
             name: 'cctype',
             values: [
               {
                 id: 'ADA',
                 name: {
                   value: 'Cardano',
                   synonyms: ['Cardano cryptocurrency', 'cardano currency']
                 }
               },
               {
                 id: 'TRX',
                 name: {
                   value: 'TRON',
                   synonyms: ['TRON', 'Torn']
                 }
               },
               {
                 id: 'HT',
                 name: {
                   value: 'Huobi Token',
                   synonyms: ['Huobi', 'HuobiToken']
                 }
               },
                {
                 id: 'LEO',
                 name: {
                   value: 'UNUS SED LEO',
                   synonyms: ['Leo', 'sed leo']
                 }
               },
               {
                 id: 'XLM',
                 name: {
                   value: 'Stellar',
                   synonyms: ['steallr cryptocurrency', 'stellar']
                 }
               },
               {
                 id: 'XMR',
                 name: {
                   value: 'Monero',
                   synonyms: ['Monero', 'monero currency']
                 }
               },
               {
                 id: 'BTC',
                 name: {
                   value: 'Bitcoin',
                   synonyms: ['bitcoin', 'bitcoin currency']
                 }
               },
               {
                 id: 'ETH',
                 name: {
                   value: 'Ethereum',
                   synonyms: ['ethereum', 'ethereum currency']
                 }
               },
               {
                 id: 'USDT',
                 name: {
                   value: 'Tether',
                   synonyms: ['tether', 'tether currency']
                 }
               },
               {
                 id: 'XRP',
                 name: {
                   value: 'XRP',
                   synonyms: ['Ripple', 'xrp']
                 }
               },
               {
                 id: 'BNB',
                 name: {
                   value: 'Binance Coin',
                   synonyms: ['bitcoincash', 'bitcoin cash']
                 }
               },
               {
                 id: 'EOS',
                 name: {
                   value: 'EOS',
                   synonyms: ['eos', 'EOs']
                 }
               },
               {
                 id: 'BCH',
                 name: {
                   value: 'Bitcoin Cash',
                   synonyms: ['bitcoincash', 'bitcoin cash']
                 }
               },
                {
                 id: 'BSV',
                 name: {
                   value: 'Bitcoin SV',
                   synonyms: ['bitcoincash', 'bitcoin cash']
                 }
               },
               {
                 id: 'LTC',
                 name: {
                   value: 'Litecoin',
                   synonyms: ['Litecoin', 'Litecoin currency']
                 }
               }
              
             ]
           }
         ]
       };


    //passing the addDirective in order to load the dynamic entities
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .addDirective(replaceEntityDirective)
      .getResponse();
  },
};

//To capture the user name
const capturenameintenthandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'capturenameintent';
  },
  async handle(handlerInput) {
    var name = handlerInput.requestEnvelope.request.intent.slots.name.value;
    const speechText = `Hey ${name},Cryptocurrency is a digital asset designed to work as a medium of exchange.
    Now tell me, About which cryptocurrency would you like to know the information.
    <break time="10ms"/>You can say I want to know about Bitcoin or I would like to know more about Ethereum`;
    
    const attributesManager = handlerInput.attributesManager;
    const attributes = await attributesManager.getPersistentAttributes() || {};
   
    if (Object.keys(attributes).length === 0) {
      attributes.name = name;
      attributes.count = 0;
      attributesManager.setPersistentAttributes(attributes);
      await attributesManager.savePersistentAttributes();
    }
   
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};


//To capture the type of currency the user wants to know about
const capturecryptocurrencytypeintenthandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'capturecryptocurrencytype';
  },
  handle(handlerInput) {
    var cryptocurrency = handlerInput.requestEnvelope.request.intent.slots.cryptocurrency.value;
    var resolvedcryptocurrency = handlerInput.requestEnvelope.request.intent.slots.cryptocurrency.resolutions.
      resolutionsPerAuthority[0].values[0].value.name;
    var cryptocurrencyid = handlerInput.requestEnvelope.request.intent.slots.cryptocurrency.resolutions.
      resolutionsPerAuthority[0].values[0].value.id;
    var i;
    var speechText;
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.askedaboutone = true;
    sessionAttributes.cryptocurrency = cryptocurrency;
    sessionAttributes.cryptocurrencyid = cryptocurrencyid;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    for(i=0;i<15;i++)
    {
      if(cryptocurrencyid === INFO[i][0])
      {
        speechText = `${INFO[i][1]}  <break time="10ms"/>. 
        If you want to know the present rank of ${resolvedcryptocurrency} ask me what is the rank `;
      }
    }
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .reprompt(speechText)
      .getResponse();
  },
};


//To capture the price of user requested cryptocurrency
const priceintenthandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'priceintent';
  },
  async handle(handlerInput) {
    let outputSpeech = 'Hai';
    var i;
    if(handlerInput.requestEnvelope.request.intent.slots.price.value)
    {
       const price = handlerInput.requestEnvelope.request.intent.slots.price.value;
       var priceid = handlerInput.requestEnvelope.request.intent.slots.price.resolutions.
           resolutionsPerAuthority[0].values[0].value.id;
       await getRemoteData('https://api.coinmarketcap.com/v1/ticker/?limit=10')
      .then((response) => {
        const data = JSON.parse(response);
          for(i=0;i<10;i++)
          {
            if(priceid === data[i].symbol)
              {
              outputSpeech = `The price of ${price} is ${Math.round(data[i].price_usd)} US Dollars.
              If you want more information, ask me more information or 
              If you are done using the skill for now, tell me stop`;
              }
          }
      })
     .catch((err) => {
        outputSpeech = err.message;
      });
    }
    else
    {
         const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
         await getRemoteData('https://api.coinmarketcap.com/v1/ticker/?limit=10')
         .then((response) => {
         const data = JSON.parse(response);
          for(i=0;i<10;i++)
          {
            if(sessionAttributes.cryptocurrencyid === data[i].symbol)
              {
                outputSpeech = `The price of ${sessionAttributes.cryptocurrency} is ${Math.round(data[i].price_usd)} US Dollars.
                If you want more information, ask me more information or 
              If you are done using the skill for now, tell me stop  `;
              }
              else if(sessionAttributes.rankid === data[i].symbol)
              {
                  outputSpeech = `The price of ${sessionAttributes.rank} is ${Math.round(data[i].price_usd)} US Dollars.
                  If you want more information, ask me more information or 
                  If you are done using the skill for now, tell me stop  `;
              }
           }
         })
        .catch((err) => {
         outputSpeech = err.message;
      });
    }
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.toldprice = true;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
   return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse();

  },
};

//if user says no to know about any information
const NoIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
  },
  async handle(handlerInput) {
    await handlerInput.attributesManager.getSessionAttributes();
    
    const speechText = `Ok! So I think I have given the rightful information till now, See you soon John. But do comeback because we have much more
    information like the top market changes, tips and successful stories`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

//To capture the rank of the user requested cryptocurrency
const rankintenthandler = {
  canHandle(handlerInput) {
    console.log("I am here");
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'rankintent';
    
  },
  async handle(handlerInput) {
    var speechText = 'You can say hello to me!';
    var i;
    if(handlerInput.requestEnvelope.request.intent.slots.rank.value)
    {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
       const rank = handlerInput.requestEnvelope.request.intent.slots.rank.value;
       var rankid = handlerInput.requestEnvelope.request.intent.slots.rank.resolutions.
           resolutionsPerAuthority[0].values[0].value.id;
           sessionAttributes.rank = rank;
        sessionAttributes.rankid = rankid;
       await getRemoteData('https://api.coinmarketcap.com/v1/ticker/?limit=10')
      .then((response) => {
        const data = JSON.parse(response);
          for(i=0;i<10;i++)
          {
            if(rankid === data[i].symbol)
              {
              speechText = `The rank of ${rank} is ${Math.round(data[i].rank)}. 
              If you want to know the price of ${rank}, ask me what is the price`;
              }
          }
      })
     .catch((err) => {
        speechText = err.message;
      });
    }
    else
    {
         const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
         await getRemoteData('https://api.coinmarketcap.com/v1/ticker/?limit=10')
         .then
         ((response) => {
         const data = JSON.parse(response);
          for(i=0;i<10;i++)
          {
            if(sessionAttributes.cryptocurrencyid === data[i].symbol)
              {
                speechText = `The rank of ${sessionAttributes.cryptocurrency} is ${Math.round(data[i].rank)}.
                If you want to know the price of ${sessionAttributes.cryptocurrency}, ask me what is the price `;
              }
              }
         })
        .catch((err) => {
         speechText = err.message;
      });
    }
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

//Help intent handler
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

//TO capture the cancel or stop requests from the user
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Thanks for using Trading Helper John!. Do visit us daily because we update you about the top market changes and give you tips and many successful stories of cryptocurrency';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

//When session ends
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

//Error handling
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

//Helper function to get the dynamic slot values
function getDynamicSlotValues(filledSlots) {
 const slotValues = {};
 Object.keys(filledSlots).forEach((item) => {
     const name  = filledSlots[item].name;
     if (filledSlots[item] &&
         filledSlots[item].resolutions &&
         filledSlots[item].resolutions.resolutionsPerAuthority[1] &&
         filledSlots[item].resolutions.resolutionsPerAuthority[1].status &&
         filledSlots[item].resolutions.resolutionsPerAuthority[1].status.code) {
         switch (filledSlots[item].resolutions.resolutionsPerAuthority[1].status.code) {
             case 'ER_SUCCESS_MATCH':
                 slotValues[name] = {
                     heardAs: filledSlots[item].value,
                     resolved: filledSlots[item].resolutions.resolutionsPerAuthority[1].values[0].value.name,
                     resolvedid: filledSlots[item].resolutions.resolutionsPerAuthority[1].values[0].value.id,
                     ERstatus: 'ER_SUCCESS_MATCH'
                 };
                 break;
             case 'ER_SUCCESS_NO_MATCH':
                 slotValues[name] = {
                     heardAs: filledSlots[item].value,
                     resolved: '',
                     resolvedid: '',
                     ERstatus: 'ER_SUCCESS_NO_MATCH'
                 };
                 break;
             default:
                 break;
         }
     } else {
         slotValues[name] = {
             heardAs: filledSlots[item].value,
             resolved: '',
             ERstatus: ''
         };
     }
 }, this);
 return slotValues;
}

//Getting the data from the coinmarket api
const getRemoteData = function (url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? require('https') : require('http');
    const request = client.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error('Failed with status code: ' + response.statusCode));
      }
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    request.on('error', (err) => reject(err));
  });
};

//Standard skill builder
const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    capturenameintenthandler,
    capturecryptocurrencytypeintenthandler,
    priceintenthandler,
    rankintenthandler,
    NoIntentHandler,
    checkmarketintenthandler,
    LaunchRequestHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withTableName('crypto-helper') //The name of the database table
  .withAutoCreateTable(true) //Automatically creates the table
  .lambda();