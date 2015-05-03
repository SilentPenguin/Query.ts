# Query.ts

Query.ts is a library for simplifying queries to arrays while maintaining readability.

Query.ts is implemented in typescript and primarily intended for use with typescript. As a result it can be used with javascript, but for the smoothest usage, it relies on interface definitions to improve ease of implementing, along with intellisense to aid with method discovery.

## What could your queries look like?

Inspired by C#'s linq, it uses similar API ideas, but instead pairs the api down to a more readable query syntax style. Your queries could look something like this:

```typescript
var items: number[] = [2, 1, 4, 3, 6, 5];
Query.from(items).take.if.not(value => value > 5).as.array(); // [2, 1, 4, 3, 5]
Query.from(items).skip.while(value => value < 3).as.array(); // [4, 3, 6, 5]
Query.from(items).mix.with(items).as.array(); // [2, 1, 4, 3, 6, 5, 2, 1, 4, 3, 6, 5]

items = [[2,1],[],[2,3]];
Query.from(items).flatten().as.array(); // [2, 1, 2, 3]
```

# What can I do with Query.ts?

Now that you have seen how a typical query might look, you are hopefully itching to get started.

To best understand what it can do, experimenting with intellisense is probably the easiest way. Query.ts was designed to be readable, methods have been stripped down to their barest representations, in both functionality, and naming. 

For those who prefer reading, please refer to the [wiki](https://github.com/SilentPenguin/Query.ts/wiki).
