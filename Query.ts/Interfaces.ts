module Query {
    export interface IConverter<TIn, TOut> { (item: TIn): TOut; }
    export interface IFilter<T> extends IConverter<T, boolean> { }
    export interface ISorter<T> { (a: T, b: T): number; }

    export interface IQuery<T> {
        any: IAny<T>;
        all: IAll<T>;
        as: IAs<T>;
        count: ICount<T>;
        flatten: IFlatten<T>;
        group: IGroup<T>;
        mix: IMix<T>;
        order: IOrder<T>;
        pair: IPair<T>;
        take: ITake<T>;
        skip: ISkip<T>;
        unique: IUnique<T>;
    }

    interface IAny<T> {
        (func?: IFilter<T>): boolean;
    }

    interface IAll<T> {
        (func?: IFilter<T>): boolean;
    }

    interface IAs<TSource> {
        <T>(func?: IConverter<TSource, T>): IQuery<T>;
    }

    interface IConjuction<T, TConj> extends IQuery<T> {
        and: TConj;
        or: TConj;
        then: IQuery<T>;
    }

    interface ICount<T> {
        (func?: IFilter<T>): boolean;
    }

    interface IFlatten<T> {
        (): IQuery<T>;
        <TOut>(func: IConverter<T, TOut[]>): IQuery<TOut>;
        <TOut>(func: IConverter<T, IQuery<TOut>>): IQuery<TOut>;
    }

    interface IFrom {
        <T>(items: T[]): IQuery<T>;
    }

    interface IGroup<T> {
        by: IGroupBy<T>;
    }

    interface IGrouping<TKey, TValue> {
        key: TKey;
        values: IQuery<TValue>;
    }

    interface IGroupBy<T> {
        <TKey, TResult>(func: IConverter<T, TKey>): IQuery<IGrouping<TKey, T>>;
    }

    interface IIf<T, TConj> {
        (func: IFilter<T>): TConj;
        not: INot<T, TConj>;
    }

    interface IMix<T> {
        with: IMixWith<T>;
    }

    interface IMixWith<T> {
        (array: T[]): IQuery<T>;
    }

    interface INot<T, TConj> {
        (func: IFilter<T>): TConj;
    }

    interface IOrder<T> {
        by: IOrderBy<T, IOrdered<T>>;
    }

    interface IOrdered<T> extends IOrder<T> {
        then: IOrder<T>;
    }

    interface IOrderBy<T, TResult> {
        (func: ISorter<T>): TResult;
    }

    interface IPair<T> {
        with: IPairWith<T>;
    }

    interface IPairWith<T> {
        <TTarget, TResult>(array: TTarget[]): IPairQuery<T, TTarget>;
    }

    interface IPairing<TSource, TTarget> {
        source: TSource;
        target: TTarget;
    }

    interface IPairQuery<TSource, TTarget> extends IQuery<IPairing<TSource, TTarget>> {
        if: <TResult>(condition: IFilter<IPairing<TSource, TTarget>>) => IQuery<IPairing<TSource, TTarget>>;
    }

    interface ITake<T> {
        (count: number): IQuery<T>;
        if: IIf<T, ITaken<T>>;
        while: IWhile<T, ITaken<T>>;
    }

    interface ITaken<T> extends IQuery<T> {
        and: ITake<T>;
        or: ITake<T>;
        then: IQuery<T>;
    }

    interface ISkip<T> {
        (count: number): IQuery<T>;
        if: IIf<T, ITaken<T>>;
        while: IWhile<T, ITaken<T>>;
    }

    interface ISkipped<T> extends IQuery<T> {
        and: ISkip<T>;
        or: ISkip<T>;
        then: IQuery<T>;
    }

    interface IUnique<T> {
        (): IQuery<T>;
        by: IUniqueBy<T>;
    }

    interface IUniqueBy<T> {
        <TKey>(func: IConverter<T,TKey>): T;
    }

    interface IWhile<T, TConj> {
        (func: IFilter<T>): TConj;
        not: INot<T, TConj>;
    }

    export var from: IFrom;
}

var items: number[];
var otheritems: number[];
var condition: Query.IFilter<number>;
var convert: Query.IConverter<number, boolean>;
var sort: Query.ISorter<number>;

Query.from(items).any(condition);
Query.from(items).all(condition);
Query.from(items).skip(10).take(5);
Query.from(items).take.if(condition);
Query.from(items).take.if.not(condition);
Query.from(items).take.while(condition);
Query.from(items).take.while.not(condition);
Query.from(items).skip.if(condition);
Query.from(items).skip.if.not(condition);
Query.from(items).skip.while(condition);
Query.from(items).skip.while.not(condition);
Query.from(items).as<boolean>();
Query.from(items).as(convert);
Query.from(items).skip.while.not(condition).as(convert);
Query.from(items).skip.if(condition).and.if.not(condition).take.if(condition).as(convert);
Query.from(items).order.by(sort).then.by(sort);
Query.from(items).group.by(convert).flatten(group => group.values);
Query.from(items).group.by(convert).as(group => group.values).flatten();
Query.from(items).pair.with(otheritems).if(pair => pair.source == pair.target).as(pair => pair.source + pair.target);
Query.from(items).unique.by(convert);
Query.from(items).mix.with(otheritems);

//-------------------------------------------

Query.from(items).skip.if(condition).then.take.if(condition).as(convert);
Query.from(items).skip(10).if(condition);
Query.from(items).skip(10).and.if(condition);
Query.from(items).skip(10).or.if(condition);
Query.from(items).and(otheritems).take.while(condition).as(convert);
Query.from(items).and.from(otheritems).as(convert);
Query.from(items).and.from(otheritems).take.if(condition).as(convert);
Query.from(items).with(otheritems).to(convert);
Query.from(items).mix(otheritems).with(condition).as(convert);
Query.from(items).mix(otheritems).using(condition).as(convert);
Query.from(items).mix.with(otheritems).using(condition).as(convert);