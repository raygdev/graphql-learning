## Subscriptions

We could use `cache.updateQuery` to update the messages from the cache.
```js
const { data: { message } } = await mutate({
      variables: { text },
      update: (cache, { data }) => {
        //first argument is object with a query property and second is a function with the oldData being passed
        cache.updateQuery({ query: messagesQuery}, (oldData) => {
          return {
            //create a property called messages and spread in the old values with the new
            messages: [...oldData.messages, data.message]
          }
        })
      }
    });
```

This does work, but likely isn't the best approach. When a user enters text,
the other user will likely not see it and the UI will not update. 

## Setting up GraphQL WebSockets

We have to install some [GraphQL Tools](https://the-guild.dev/graphql/tools/docs/api/modules/schema_src)
first. 
