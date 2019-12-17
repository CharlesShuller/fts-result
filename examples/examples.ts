//Alias the whole package
import * as Result from '../src/Result';

//Import some things we use a lot
import { ResultErrorNumber, Ok, Err } from '../src/Result';


function example1() {
    const okValue = Ok(5);
    const errValue = Err( new Error("Some message") );

    const errorFromNull = Result.fromNullable( null, new Error("null instead of value") );
    const errorFromUndefined = Result.fromNullable( undefined, new Error("undefined instead of value") );

    const okFromNullable = Result.fromNullable(12, new Error("should never see this"));

    return {
        okValue,
        errValue,
        errorFromNull,
        errorFromUndefined,
        okFromNullable
    }
}



function example2() {
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
}




function example3() {
    const fakeParseUserInput: () => Result.Result<string, number> = () => {
        return Ok(5);
    }

    const result = fakeParseUserInput()
        .fmap( (v) => v + 2 )
        .then( (v) =>  Err<string, number>("Something is wrong") )
        .fmap( (v) => v/11 ) as Result.Result<string, number>

    return Result.unbox(
        result,
        (v) => "After munging, the user provided number is: " + v,
        (e) => "An error occurred during munging: " + e
    );
}

function main() {
    console.log("example1: " + JSON.stringify(example1(), null, 2));
    example2();
    console.log("example3: " + example3());
}

main();
