import {Client} from 'theseus';
import {Http} from 'any-http-reqwest';
// or: import {Http} from 'any-http-jquery';
// Problem with install 'any-promise-es6', use ES6 Promise directly instead
//import {Promise} from 'any-promise-es6';

var client = new Client({http: new Http, promise: Promise});

var print = (...args) => console.log(...args);

// FIXME: make it return the correct media-type
var resource = client.resource('...'); // <- point to tag api
console.log(resource);
console.log(resource.get());
resource.getData().then(data => console.log(data), err => console.error(err.stack));
resource.follow('tags', {query: 'victorian'}).getData().then(print);
resource.follow('tags').get({query: 'victorian'}).then(print);

resource.follow('missing').getData().then(data => console.log("missing resp", data), err => console.error("missing error", err.stack));


var res = client.resource('https://argo-demo-server.herokuapp.com');
res.getData().then(print);
res.getLinks().then(print, console.error.bind(console));
res.follow('books').getData().then(print).catch(console.error.bind(console));
res.follow('books').follow('next').getData().then(print);
res.follow('books').post({title: 'Nova', author: 'Samuel L. Delany'}).then(print);

var book = res.follow('books').post({title: 'Glasshouse', author: 'Charles Stross'});
book.then((r) => {
  print(r.uri);
  r.getData().then(print);
  r.get().
    then(x => print("GET book", x)).
    then(() => {
      return r.put({title: 'Accelerando', author: 'Charlie Stross'}).then(z => print("PUT", z));
    }).
    then(() => {
      return r.delete();
    }).then(() => {
      r.get().then(x => print("GET again", x), e => print("book is gone", e));
    });
});



function* foo() {
  console.log("first");

  var book = yield res.follow('books').post({title: 'Glasshouse', author: 'Charles Stross'});
  print(book.uri);
  var data = yield book.getData();
  print(data);
  yield timeout(1000);

  var bookData = yield book.get();
  print("GET", bookData);
   // yield book.delete();
//  r.get().data.then(x => print("GET again", x));

  console.log("second");
}

spawn(foo);



function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function spawn(genF) {
  return new Promise((resolve, reject) => {
    var gen = genF();
    function step(nextF) {
      var next;
      try {
        next = nextF();
      } catch(e) {
        reject(next);
        return;
      }
      if (next.done) {
        resolve(next.value);
        return;
      }
      // Promise.cast(next.value).then(
      Promise.resolve(next.value).then(
        v => step(() => gen.next(v)),
        e => step(() => gen.throw(e))
      );
    }
    step(() => gen.next(undefined));
  });
}
