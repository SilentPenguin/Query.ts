interface Converter<TIn, TOut> {
    (item: TIn): TOut;
}
interface Filter<T> extends Converter<T, boolean> { }

interface ILinq<T> extends IFrom<T> {
    any: IAny<T>;
    all: IAll<T>;
    to: ITo<T>;
    take: ITake<T>;
    skip: ISkip<T>;
}

interface IAny<T> {
    (func: Filter<T>): boolean;
}

interface IAll<T> {
    (func: Filter<T>): boolean;
}

interface ITo<TSource> {
    <T>(func: Converter<TSource, T>): ILinq<T>;
}

interface IFrom<T> {
    (items: T[]): ILinq<T>;
}

interface IFlow<T, TConj> {
    (func: Filter<T>): TConj;
}

interface INot<T, TConj> extends IFlow<T, TConj> {
    not: (func: Filter<T>) => TConj;
}

interface IAction<T, TConj> {
    (count: number): TConj;
    if: IIf<T, TConj>;
    while: IWhile<T, TConj>;
}

interface IConjuction<T, TConj> extends ILinq<T> {
    and: TConj;
    or: TConj;
    then: ILinq<T>;
}

interface IIf<T, TConj> extends INot<T, TConj> { }
interface IWhile<T, TConj> extends INot<T, TConj> { }

interface ITake<T> extends IAction<T, ITaken<T>> { }
interface ISkip<T> extends IAction<T, ISkipped<T>> { }

interface ITaken<T> extends IConjuction<T, ITake<T>> { }
interface ISkipped<T> extends IConjuction<T, ISkip<T>> { }

var from: ILinq<number>;
var items: number[];
var otheritems: number[];
var condition: Filter<number>;
var convert: Converter<number, boolean>;

from(items).any(condition);
from(items).all(condition);
from(items).skip(10).take(5);
from(items).take.if(condition);
from(items).take.if.not(condition);
from(items).take.while(condition);
from(items).take.while.not(condition);
from(items).skip.if(condition);
from(items).skip.if.not(condition);
from(items).skip.while(condition);
from(items).skip.while.not(condition);
from(items).to(convert);
from(items).skip.while.not(condition).to(convert);
from(items).skip.if(condition).and.if.not(condition).take.if(condition).to(convert);

//-------------------------------------------
from(items).skip.if(condition).then.take.if(condition).to(convert);
from(items).skip(10).if(condition);
from(items).skip(10).and.if(condition);
from(items).skip(10).or.if(condition);
from(items).and(otheritems).take.while(condition).to(convert);
from(items).and.from(otheritems).to(convert);
from(items).and.from(otheritems).take.if(condition).to(convert);
from(items).with(otheritems).to(convert);
from(items).mix(otheritems).with(condition).as(combiner);
from(items).mix(otheritems).using(condition).to(convert);
from(items).mix.with(otheritems).using(condition).to(convert);