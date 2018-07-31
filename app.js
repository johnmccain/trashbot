/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

bot.dialog('/', function (session) {
    session.send('You said ' + session.message.text);
    let dh = new DialogueHandler(session.message.text);
    if (dh.shouldRespond()) {
        session.send(dh.getResponse());
    }
});

class DialogueHandler {
    helpmessage = "lol"
    
    constructor(text)
    {
        this.tokens = text.split(' ');
    }

    shouldRespond()
    {
        return (self.tokens.length > 1) && self.tokens[0] === "trashbot";
    }

    getResponse()
    {
        if (self.tokens.length === 1) {
            return "what?";
        } else if (self.tokens.length >= 2 && self.tokens[1] == "help") {
            return self.helpmessage;
        } else {
            return "idk what u mean";
        }
    }
}