Result
===============================================================================
Result is a type used extensively in functional programming (in Haskell, you
should refer to the Data.Either package).  It's chief value is to handle error
propigation in a purely functional way.  It's a lot like an enhanced version
of Maybe.

From a different perspective, we use result to avoid _handling_ exceptions.
Throwing an exception can still be purely functional, but catching exceptions
breaks referential transparency, so the catching function is no longer pure.

In general, exceptions should only be thrown for programmer errors, or
other non-recoverable errors.  Otherwise, your using them for flow control,
which is almost always a bad thing.



Quickstart
-------------------------------------------------------------------------------
Install with:
```
npm install --save fts-result
```


Import with:
```
import * as Result from 'fts-result';
```


Know:  Results are either "Ok" or "Err".  We use "Err" instead of "Error"
to avoid a lot of confusion with the built in "Error" class.

Create a Result value:
```
//Alias the whole package
import * as Result from 'fts-result';

//Import some things we use a lot
import { ResultErrorNumber, Ok, Err } from 'fts-result';

const okValue = Ok(5);
const errValue = Err( new Error("Some message") );

const errorFromNull = Result.fromNullable( null, new Error("null instead of value") );
const errorFromUndefined = Result.fromNullable( undefined, new Error("undefined instead of value") );

const okFromNullable = Result.fromNullable(12, new Error("should never see this"));
```


Unbox a result value:
```
//Alias the whole package
import * as Result from 'fts-result';

//Import some things we use a lot
import { ResultErrorNumber, Ok, Err } from 'fts-result';


const ok5 = Ok(5);
const error: ResultErrorNumber = Err(new Error("Some Error"))


const okValue = Result.fromOk(ok5);

try {
    const raisesException = Result.fromOk(error);
} catch(e) {
    //e === new Error("Some Error")
}



const errValue = Result.fromErr(error);
//const raisesException = Result.fromErr(ok5);



// numberOrError will be an Error with a message of "Some Error"
//
// The first argument is a Result of type Result<Error, number>
// The second argument is a callback that gets called when Result is Ok
// The third argument is a callback that gets called when Result is Err
//
// For a final return of complex types, you will need to specify the
// type parameters.
const numberOrError: number | Error =
    Result.unbox<Error, number, number | Error>(
        error,
        (value: number) => value,
        (err) => err
    );



// Canonical switch statement for uses not covered above
//
// This is the recomended way to handle types like Result in the typescript
// handbook and results in completeness checking at compile time, just make
// sure your function has a return type.
//
switch(ok5.kind) {
    case "Ok": {
        console.log("Ok have a value: " + ok5.value);
        break;
    }
    case "Err": {
        console.log("Errs have an err");
        break;
    }
}

// You can also use the following, but generally the compiler won't
// be able to tell if the Maybe is a Just or Nothing in later code,
// requiring some typecasting.
Result.isOk(ok5); // true
Result.isErr(ok5); // false
```


Chaining Results together.   This is one of the most powerful things you
can do with a Result, letting you specify a long list of functions that
assume the result is an Ok, and then you only have to worry about a
possible error at the end.

The "then" callback accepts a value, and is only called when the previous
Result is an ok.  This function MUST return a Monad(something that implements
Monad, like Result or Maybe).

The "fmap" callback accepts a value, and is also only called when the
previous Result is an ok.  This function just needs to return a new value,
and handles boxing that value up into an Ok Result for you.

```
const fakeParseUserInput: () => Result.Result<string, number> = () => {
    return Ok(5);
}

const result = fakeParseUserInput()
    .fmap( (v) => v + 2 )
    .then( (v) =>  Err<string, number>("Something is wrong") )
    .fmap( (v) => v/11 ) as Result.Result<string, number>
```
