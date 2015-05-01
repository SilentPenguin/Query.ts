# Query.ts
Query.ts is a library for simplifying queries to arrays while maintaining readability.
Query.ts is implemented in typescript and primarily intended for use with typescript. As a result it can be used with javascript, but for the smoothest usage, it relies on interface definitions to improve ease of implementing, along with intellisense to aid with method discovery.

## What could your queries look like?
Inspired by C#'s linq, it uses similar API ideas, but instead pairs the api down to a more readable query syntax style. Your queries could look something like this:
```typescript
var items: number[] = [2, 1, 4, 3, 6, 5];
Query.from(items).take.if.not(value => value > 6).as.array(); // [2, 1, 4, 3, 5]
Query.from(items).skip.while(value => value < 3).as.array(); // [4, 3, 6, 5]
Query.from(items).mix.with(items).as.array(); // [2, 1, 4, 3, 6, 5, 2, 1, 4, 3, 6, 5]

items = [[2,1],[],[2,3]];
Query.from(items).flatten().as.array(); // [2, 1, 2, 3]
```

# What can I do with Query.ts?
Now that you have seen how a typical query might look, you are hopefully itching to get started. To best understand what it can do, experimenting with intellisense is probably the easiest way. Query.ts was designed to be readable , methods have been stripped down to their barest representations, in both functionality, and naming. For those who prefer reading, an alphabetical list of the api interfaces and methods has been provided below.

#Documentation

##Functions

####```Query.from<T>(array: T[]) : IQuery<T>```
This is the only exposed function in the Query module, this function is the hook in for the library, and it converts an array you provide it into a query, which then contains all the querying methods for you to access. Typically, it's usage would look like:
```typescript
var array: bool[] = [false, true, true, false];
Query.from(array);
```
##Interfaces

###Objects

####```IQuery<T>```
```IQuery<T>``` is the lifeblood of the library, and is returned by most method chains, allowing you to query while you query. Each ```IQuery<T>``` hides behind it a chain of iterators, with the evaluation of each iterator is only resolved when necessary.

#####```IQuery<T>``` Methods
- ```all(func: IFilter<T>) : boolean``` Tests if all the items in an array match a given conditional.
- ```any(func: IFilter<T>) : boolean``` Tests for any objects that meet a condition. The filter is used to test if the items in an array any of the items match a given condition. If no function is given, all objects are selected, and the function returns true if the Query is not empty.
- ```as<TOut>(func: IConverter<T, TOut>) : IQuery<TOut>``` Converts a single iteration object from one type to another. This can involve either selection of a property on the item or construction of a new item. Whatever the converter returns will be used as the new IQuery.
- ```as.array() : T[]``` Converts a query set into an array.
- ```count(func?: IFilter<T>): number``` Returns the number of items in the query set. The count will only be increased by items that match the filter. If no filter is given, all items will be counted.
- ```first(func?: IFilter<T>): T``` Returns the first element in the query set. If a filter is given, the first item that matches that filter will be returned.
- ```flatten<TOut>(func?: IConverter<T, TOut[]>): IQuery<TOut>```
- ```flatten<TOut>(func?: IConverter<T, IQuery<TOut>): IQuery<TOut>``` For each item in the result returned by the converter, the result is flattened into the result set, if a result is empty, a result is not included.
- ```group.by<TKey>(func: IConverter<T, TKey>): IQuery<IGrouping<TKey, T>``` Groups items of an IQuery into an IGrouping, where the key for that group is selected using the converter.
- ```last<TKey>(func?: IConverter<T, TKey>): T``` Counterpart to first, returing the last item in a query set.
- ```maximum(): IQuery<T>``` Returns the matching maximums of ```T```, using direct comparison. This is the same as calling ```maximum.by(item => item)```
- ```maximum.by(func?: IConverter<T, Key>): IQuery<T>``` Returns all Ts that have the maximum value provided by the converter.
- ```minimum(): IQuery<T>``` Returns the matching minimum of ```T```s, using direct comparison. This is the same as calling ```maximum.by(item => item)```
- ```minimum.by(func?: IConverter<T, Key>): IQuery<T>``` Returns all Ts that have the minimum value provided by the converter.
- ```mix.with(array: T[]>): IQuery<T>```
- ```mix.with(array: IQuery<T>>): IQuery<T>``` The results of the provided array will be returned after the source array.
- ```only(func?: IFilter<T>): boolean``` checks that there is only one item that matches the filter. If no filter is given, the query set must contain only one item.
- ```order.by(func: IConverter<T, TKey>): IQuery<T>``` Orders a query set based on the key provided. For this operation, the entire set must be iterated before a result can be returned.
- ```order.by(func: IConverter<T, TKey>)then.by(func: IConverter<T, TKey>): IQuery<T>``` Further orders an ordered set based on an additional key if the previous keys are equal. Then.by can be linked as many times as you wish.
- ```pair.with<TWith>(array: TWith[]>): IQuery<IPairing<T, TWith>>```
- ```pair.with<TWith>(array: IQuery<TWith>>): IQuery<IPairing<T, TWith>>``` Pairs each item with every other item in the set retaining the order of the source set, and the inner set for each item in the main source.
- ```pair.with<TWith>(array: TWith[]>).if(func: IFilter<IPairing<T, TWith>>): IQuery<IPairing<T, TWith>>```
- ```pair.with<TWith>(array: IQuery<TWith>>).if(func: IFilter<IPairing<T, TWith>>): IQuery<IPairing<T, TWith>>``` Performs the same action as pairing, however the pair is tested using the filter before being included in the set.
- ```reverse(): IQuery<T>``` The items from the set are returned in reverse order.
- ```single(): T``` Returns a single value if the set contains only one item, otherwise returns null.
- ```skip(count: number): IQuery<T>``` skips over a given number of items, returning a query set that excludes those items.
- ```skip.if(func: IFilter<T>): IQuery<T>``` Excludes items that match the given filter.
- ```skip.if.not(func: IFilter<T>): IQuery<T>``` Excludes items that do not match the given filter.
- ```skip.while(func: IFilter<T>): IQuery<T>``` Excludes items from the given query set while the given filter is met.
- ```skip.while.not(func: IFilter<T>): IQuery<T>``` Effectively the same as calling ```.skip.until```.
- ```skip.until(func: IFilter<T>): IQuery<T>``` Excludes items from the given query set until the given filter is met.
- ```skip.until.not(func: IFilter<T>): IQuery<T>``` Effectively the same as calling ```.skip.while```.
- ```take(count: number): IQuery<T>``` Includes a given number of items, returning a query set that contains only those items.
- ```take.if(func: IFilter<T>): IQuery<T>``` Includes items that match the given filter, excluding any that do not.
- ```take.if.not(func: IFilter<T>): IQuery<T>``` Includes items that do not match the given filter.
- ```take.while(func: IFilter<T>): IQuery<T>``` Includes items from the given query set while the given filter is met.
- ```take.while.not(func: IFilter<T>): IQuery<T>``` Effectively the same as calling ```.take.until```
- ```take.until(func: IFilter<T>): IQuery<T>``` Includes items from the given query set until the given filter is met.
- ```take.until.not(func: IFilter<T>): IQuery<T>``` Effectively the same as calling ```.take.while```.
- ```unique(): IQuery<T>``` Ensures that every item in the array is unique. This effectively the same as calling ```.unique.by(item => item)```.
- ```unique.by<TKey>(func: IConverter<T, TKey>): IQuery<T>``` Returns a query set, where only the first item to match the given key converter is included.
- ```zip.with<TWith>(array: TWith[]): IQuery<IPairing<T, TWith>>```
- ```zip.with<TWith>(array: IQuery<TWith>): IQuery<IPairing<T, TWith>>``` returns a set where each item from the original set has been included with the corresponding item in the provided set. This continues either set is empty, and then the remaining items on the counterpart set are discarded.

####```IIterator<T>```
```IIterator<T>``` represents an iterable object. IQuerys are wrappers to IIterators, and the chainable api calls will return a new IQuery with a new IIterator inside it.

#####```IIterator<T>``` Methods
- ```all(): T[]``` Returns all the items an iterator would normally return, as an array.
- ```reset(): void``` Resets the iterator to its initial state prior to any iteration.
- ```next(reset?: boolean): IIteratorResult<T>``` Returns the next iteration. If reset is true, ```reset()``` will also be called prior to fetching the next item.

###Function Callbacks

####```IFilter<T>```
```IFilter<T>``` matches the signature ```<T>(value: T): boolean```. This function is used to decide if a specific element is applicable for the current action. This means it is often used in decisions.

####```IConverter<TIn, TOut>```
```IConverter<TIn, TOut>``` matches the signature ```<TIn, TOut>(value: TIn): TOut```. This function is used to mutate an object from one type to another. This means it is often used directly by the user, providing the return result the user expects, or indirectly, by selecting a key or value to use in a test.
