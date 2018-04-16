var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser =require('body-parser');
var app = express();

const port = 3000;
const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j','admin123'));
const session = driver.session();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extented: false }));
app.use(express.static(path.join(__dirname, 'stylesheets')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/views/organizations.html'));
});

app.get('/organizationsAPI/:userInput', (req, res)=>{
  // Variables for Query and Data contruction
  var queryInput = req.params.userInput;
  var dataInput = queryInput.replace(/[""]/g, '');

  session
    .run(`MATCH p=(:Person)-[:IN_ORGUNIT]->(:OrgUnit { name: \'${dataInput}\' }) return p limit 500`)
    .then((result)=>{
      var data = {nodes:[{name: dataInput}], links:[]};
      result.records.forEach((record)=>{
        data.nodes.push({
          name: record._fields[0].start.properties.name,
          orgUnit: record._fields[0].segments[0].end.properties.name,
          uid: record._fields[0].start.properties.uid
        });
        data.links.push({
          source: record._fields[0].start.properties.name,
          target: record._fields[0].segments[0].end.properties.name
        });
      });
      res.write(JSON.stringify(data));
      res.end();
     })
    .catch(function(err){
      console.log(err);
    });
});

app.get('/contacts', (req, res) =>{
  session
    .run('Match (n:Person) Where n.telephoneNumber Is Not Null return n.name, n.telephoneNumber, n.emailAddress, n.employeeNumber Order By n.name')
    .then((result)=>{
      var contactArry = [];
      result.records.forEach((record)=>{
          contactArry.push({
              name: record._fields[0],
              emailAddress: record._fields[2],
              employeeNumber: record._fields[3],
              telephoneNumber: record._fields[1]
            });
          });

          var readyData = contactArry.map( Object.values );
          // empty object to store
          var sortedEmployees = {};

          // dertermines how many values start with a particular letter
          contactArry.forEach((contact) => {
            const firstLetter = contact.name.substring(0,1); // doesnt go beyond first letter

            if (!sortedEmployees[firstLetter]) { //if first letter is still 0
              sortedEmployees[firstLetter] = [];
            }
            sortedEmployees[firstLetter].push(contact)

          });


          res.render('index', {
            contactNames: sortedEmployees
          });
    })
    .catch(function(err){
      console.log(err);
    });
});

app.get('/variableInput/:variable', (req, res)=>{
  var Input = req.params.variable;
  var responseVariable = 'You passed the variable, ' + Input.replace(/[:]/g, '') + ', into the URL! Keep making awesome progress!!!';
  res.send(responseVariable);
});

app.get('/test', (req, res)=>{
  req.params = "something"
  console.log(req.params);
  res.sendFile(path.join(__dirname+'/views/test.html'));

});

app.listen(3000);
console.log('Server Started on Port 3000');

module.exports = app;
