/*
 * Copyright 2019 Charles Shuller
 *
 * This file is part of fts-maybe.
 *
 * fts-maybe is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * fts-maybe is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with fts-maybe.  If not, see <https://www.gnu.org/licenses/>.
*/

import * as Result from "../Result"

test("Just can construct an ok", () => {
    const ok5: Result.ResultErrorNumber  = Result.Ok(5);

    switch(ok5.kind) {
        case "Ok": {
            expect(ok5.value).toBe(5);
            break;
        }
        case "Err": {
            expect(ok5.kind).toBe("Ok");
            break;
        }
    }
});

test("Nothing can construct an err", () => {
    const errorMessage = "Error Message";
    const err: Result.ResultErrorNumber = Result.Err(new Error(errorMessage));

    switch(err.kind) {
        case "Ok": {
            expect(err.kind).toBe("Err");
            break;
        }
        case "Err": {
            expect(err.err.message).toBe(errorMessage);
            break;
        }
    }
});

test("We can unbox an Ok", () => {
    const ok5 = Result.Ok(5);
    const okUnboxed = Result.unbox(ok5, (value) => value, (err) => null);

    expect(okUnboxed).toBe(5);
});


test("We can unbox an Err", () => {
    const errorMessage = "Some Error";
    const errRes = Result.Err(new Error(errorMessage));
    const errUnboxed = Result.unbox(errRes, (value) => value, (err) => null);

    expect(errUnboxed).toBe(null);
});


test("Bind can produce an ok result", () => {
    const ok10 = Result.Ok(5)
        .bind( (value) => Result.Ok(value*2) ) as Result.ResultErrorNumber;

    Result.unbox(
        ok10,
        (value) => expect(value).toBe(10),
        (err) => fail("Expected result kind to be Ok")
    );
});


test("Bind can produce an error result", () => {
    const errorMessage = "Another Error Message";
    const thisError = new Error(errorMessage);

    const err = Result.Ok(5)
        .bind( (value) => Result.Err(thisError) ) as Result.ResultErrorNumber;

    Result.unbox(
        err,
        (value) => fail("Expected result kind to be Err"),
        (e) => expect(e.message).toBe(errorMessage)
    );
});


test("isOk can correctly detect an Ok kind", () => {
    const ok5 = Result.Ok(5);
    expect(Result.isOk(ok5)).toBe(true);
});

test("isOk can correctly detect an Err kind", () => {
    const err = Result.Err(new Error("message"));
    expect(Result.isOk(err)).toBe(false);
});


test("isErr can correctly detect an Ok kind", () => {
    const ok5 = Result.Ok(5);
    expect(Result.isErr(ok5)).toBe(false);
});

test("isOk can correctly detect an Err kind", () => {
    const err = Result.Err(new Error("message"));
    expect(Result.isErr(err)).toBe(true);
});


test("fromNullable can construct an Ok from a non-null value", () => {
    const errorMessage = "YAEM";
    const errorIfNull = new Error(errorMessage);

    const nullable: number | null = 5;
    const ok5 = Result.fromNullable(nullable, errorIfNull);

    Result.unbox(
        ok5,
        (value) => expect(value).toBe(5),
        (e) => fail("Got an error kind of result")
    );
});


test("fromNullable can construct an Err from a null value", () => {
    const errorMessage = "YAEM";
    const errorIfNull = new Error(errorMessage);

    const nullable: number | null = null;
    const err = Result.fromNullable(nullable, errorIfNull);

    Result.unbox(
        err,
        (value) => fail("Got an ok kind of result"),
        (e) => expect(e.message).toBe(errorMessage)
    );
});


test("fromException can construct an Ok Result", () => {
    const exceptionRaisingFunction = () => 5;
    const result = Result.fromException(exceptionRaisingFunction);

    Result.unbox(
        result,
        (value) => expect(value).toBe(5),
        (err) => fail("A Result of kind Err was received")
    );
});

test("fromException can construct an Err Result", () => {
    const errorMessage = "This is an error message";
    const exceptionError = new Error(errorMessage);
    const exceptionRaisingFunction = () => {
        throw exceptionError;
    }

    const result: Result.ResultErrorNumber =
        Result.fromException(exceptionRaisingFunction);

    Result.unbox(
        result,
        (value) => fail("Result of kind Ok received"),
        (err) => expect(err.message).toBe(errorMessage)
    );
});


test("errMap can return an Ok", () => {
    const result = Result.Ok(5)
        .mapErr( (err) => new Error("New Error") ) as Result.ResultErrorNumber;

    Result.unbox(
        result,
        (value) => expect(value).toBe(5),
        (e) => fail("Received Err kind of Result")
    );
});

test("errMap can return an Err", () => {
    const oldErrorMessage = "Old Error Message";
    const newErrorMessage = "New Error Message";

    const oldError = new Error(oldErrorMessage);
    const newError = new Error(newErrorMessage);

    const result = Result.Err(oldError)
        .mapErr( (e) => newError ) as Result.ResultErrorNumber;

    Result.unbox(
        result,
        (value) => fail("Result of kind Ok received"),
        (e) => expect(e.message).toBe(newErrorMessage)
    );
});


test("fromOk can return the value for an Ok", () => {
    const result = Result.Ok(5);
    const value = Result.fromOk(result);

    expect(value).toBe(5);
});

test("fromOk can raise the error for an Err", () => {
    const errorMessage = "Some error message";
    const err = Result.Err( new Error(errorMessage) );

    expect( () => Result.fromOk(err) ).toThrow( new Error(errorMessage) );
});


test("fromErr can return the err for an Err", () => {
    const errorMessage = "Some error message";
    const err = Result.Err( new Error(errorMessage) );

    expect( Result.fromErr(err) ).toStrictEqual( new Error(errorMessage) );
});

test("fromErr can raise an exception when called with an Ok", () => {
    const ok = Result.Ok(5);

    expect( () => Result.fromErr(ok) ).toThrow();
});
