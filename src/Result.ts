/**
 * Main module for the Result type.
 *
 * Copyright 2019 Charles Shuller
 *
 * This file is part of fts-result.
 *
 * fts-result is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * fts-result is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with fts-result.  If not, see <https://www.gnu.org/licenses/>.
 *
 */


/**
 * Please note, we use the term "err" or "Err" to refer to errors in this
 * result type.  This is primarily to avoid conflicts and confusion with the
 * built in Error type, particularly if we ever need to use it in this module.
 */



import { Monad, BindFunction, SequenceFunction, defaultThen } from 'fts-monad';
import { Functor, FmapFunction } from 'fts-functor';



//It's really common to use the Error type with results, so we provide an
//alias for it and an arbitrary value type.
export type ResultError<V> = Result<Error, V>;

//ResultErrors for some fundamental types
export type ResultErrorNumber = ResultError<number>;
export type ResultErrorString = ResultError<string>;
export type ResultErrorBoolean = ResultError<boolean>;


/**
 * Type used to define a Result.  A Result is an _Err or _Ok, but
 * those classes should not be used directly, instead use the factory
 * methods Err and Ok.
 *
 * @typeparam V This is the value type of the Result
 * @typeparam E This is the value type of the Error
 */
export type Result<E, V> = _Err<E, V> | _Ok<E, V>;


export type ErrMapFunction<Ei, Eo> = (err: Ei) => Eo;



/**
 * This class represents an Error of some sort.  While generally this
 * will be the standard "Error" class, it does not have to be.
 *
 * @typeparam V This is the value type of the Result
 * @typeparam E This is the value type of the Error
 */
class _Err<E, V> implements Monad<V> {
    readonly kind = "Err";
    constructor(readonly err: E) {}

    fmap<Vo>( fmapFunction: FmapFunction<V, Vo> ): Result<E, Vo> {
        return Err( this.err );
    }

    bind<Vo>(bindFun: BindFunction<V, Vo>): Monad<Vo> {
        return Err( this.err );
    }

    seq<Vo>(sequenceFunction: SequenceFunction<Vo>): Monad<Vo>{
        return Err( this.err );
    }


    then<Vo>(
        bindOrSequenceFunction: BindFunction<V, Vo>
                              | SequenceFunction<Vo>
    ): Monad<Vo> {
        return Err( this.err );
    }

    mapErr<Eo>(errMapFun: ErrMapFunction<E, Eo>): Monad<V> {
        return Err( errMapFun(this.err) );
    }
}




/**
 * This class represents an acutal value of some sort.
 *
 * @typeparam V This is the value type of the Result
 * @typeparam E This is the value type of the Error
 */
class _Ok<E, V> implements Monad<V> {
    readonly kind = "Ok";
    constructor(readonly value: V) {}

    fmap<Vo>( fmapFunction: FmapFunction<V, Vo> ): Result<E, Vo> {
        return Ok( fmapFunction(this.value) );
    }

    bind<Vo>(bindFun: BindFunction<V, Vo>): Monad<Vo> {
        return bindFun(this.value);
    }

    seq<Vo>(sequenceFunction: SequenceFunction<Vo>): Monad<Vo>{
        return sequenceFunction();
    }


    then<Vo>(
        bindOrSequenceFunction: BindFunction<V, Vo>
                              | SequenceFunction<Vo>
    ): Monad<Vo> {
        return defaultThen(this.value, bindOrSequenceFunction);
    }

    mapErr<Eo>(errMapFun: ErrMapFunction<E, Eo>): Monad<V> {
        return Ok(this.value);
    }
}



/**
 * This is the factory function for creating an Err kind of result.
 *
 * @typeparam E This is the value type of the Error
 * @typeparam V This is the value type of the Result
 */
export function Err<E, V>(err: E): Result<E, V> {
    return new _Err<E, V>(err);
}


/**
 * This is the factory function for creating an Ok kind of result.
 *
 * @typeparam E This is the value type of the Error
 * @typeparam V This is the value type of the Result
 */
export function Ok<E, V>(value: V): Result<E, V> {
    return new _Ok<E, V>(value);
}



/**
 * This function "unboxes" a result, returning the value of either the
 * okCallback or the errCallback.
 *
 * You do need to make sure that both callbacks return the same type, tough
 * this could be a union type, i.e.:
 *
 *     const someVar: number | null =
 *        unbox(result, (value) => value, (error) => null);
 *
 * @typeparam E This is the value type of the Error
 * @typeparam V This is the value type of the Result
 * @typeparam R This is the type of the return value
 */
export function unbox<E, V, R>(
    result: Result<E, V>,
    okCallback: (value: V) => R,
    errCallback: (error: E) => R
): R {
    switch(result.kind) {
        case "Ok": {
            return okCallback(result.value);
            break;
        }
        case "Err": {
            return errCallback(result.err);
            break;
        }
    }
}


/**
 * Returns true if result is of Ok kind, false otherwise.
 *
 *
 * @typeparam E This is the value type of the Error
 * @typeparam V This is the value type of the Result
 */
export function isOk<E, V>(result: Result<E, V>): boolean {
    return result.kind === "Ok";
}

/**
 * Returns true if result is of Err kind, false otherwise
 *
 * @typeparam E This is the value type of the Error
 * @typeparam V This is the value type of the Result
 */
export function isErr<E, V>(result: Result<E, V>): boolean {
    return !isOk(result);
}


/**
 * Returns a result constructed from a nullable type.  This is primarily
 * used to map non-result types into result types.
 *
 * If nullable is null or undefined, a result of kind Err with err set to
 * errorIfNull is returned.
 *
 * If nullable is not null or undefined, a result of kind Ok with value
 * set to nullable is returned.
 *
 * @typeparam E This is the value type of the Error
 * @typeparam V This is the value type of the Result
 */
export function fromNullable<E, V>(
    nullable: any,
    errorIfNull: E):
Result<E, V> {
    if(nullable) {
        return Ok(nullable);
    } else {
        return Err(errorIfNull);
    }
}


/**
 * Returns a result constructed from a function which otherwise raises an
 * exception to report an error.  This is primarily useful to convert
 * non-functional code into funtional code.  Exception raising is pure,
 * but handling exceptions is not pure (since the return is no longer
 * defined exclusively by the parameters)
 *
 * Use this function ONLY if you expect to handle the erros at a later point.
 * Some exceptions SHOULD go unhandled and terminate the program, there is
 * no need to do extra work to try and handle those.
 *
 * If exceptionRaisingFunction does not throw an exception, a Result of kind Ok with
 * the return of exceptionRaisingFunction as it's value.
 *
 * If exceptionRaisingFunction does throw an exception, a Result of kind Err
 * with the raised exception will be returned instead.
 *
 * @typeparam E This is the value type of the Error
 * @typeparam V This is the value type of the Result
 */
export function fromException<E, V>(
    exceptionRaisingFunction: () => V
): Result<E, V> {
    try {
        const value = exceptionRaisingFunction();
        return Ok(value);
    } catch(err) {
        return Err(err);
    }
}


/**
 * This function will yield the unboxed OK value for Results of Ok kind,
 * otherwise it raises the error value as an exception.  Use this when
 * you are already certain you have an Ok value or an un-handleable exception.

 *
 * @typeparam E This is the value type of the Error
 * @typeparam V This is the value type of the Result
 */
export function fromOk<E, V>(result: Result<E, V>): V {
    return unbox(
        result,
        (value) => value,
        (err) => {throw err;}
    );
}


/**
 * This function will yield the unboxed Err value for Results of Err kind,
 * otherwise it raise an exception.
 *
 * @typeparam E This is the value type of the Error
 * @typeparam V This is the value type of the Result
 */
export function fromErr<E, V>(result: Result<E, V>): E {
    return unbox(
        result,
        (value) => {throw new Error("fromErr was called with an Ok Result"); },
        (err) => err
    );
}
