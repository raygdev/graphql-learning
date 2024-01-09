async function fetchGreeting() {
    const response = await fetch('http://localhost:9000', {
        //apollo server accepts post requests not get for GraphQL queries
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            //stringify the query for the body and structure the query as a string value for the query property
            query: 'query { greeting }'
        })
    })
    const body = await response.json()
    console.log("body:", body)
    //the data property holds the value we are looking for
    return body.data.greeting
}

fetchGreeting().then(greeting => {
    //update the page with the string value from the server 
    document.getElementById('greeting').textContent = greeting
})