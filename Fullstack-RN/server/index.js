const express=require('express'),
http=require('http');
const hostname='localhost';
const port=9000;
const app=express();

app.use((req, res)=> {
        console.log(req.headers); 
        res.statusCode=200; 
        res.setHeader('Content-Type', 'text/html'); 
        res.end('<html><body><h1>This is a test server</h1></body></html>');
});
const sample_server=http.createServer(app);

let rectangle= {
    perimeter: (x, y)=> (2*(x+y)), area: (x, y)=> (x*y)
};

function Rectangle(l, b) {
    console.log("A rectangle with l = " + 
        l + " and b = " + b);

    if (l <=0 || b <=0) {
        console.log("Error! Rectangle's length & "
        + "breadth should be greater than 0: l = " 
        + l + ", and b = " + b);
    }

    else {
        console.log("Area of the rectangle: " 
            + rectangle.area(l, b));
        console.log("Perimeter of the rectangle: " 
            + rectangle.perimeter(l, b));
    }
}

Rectangle(1, 8);
Rectangle(3, 12);
Rectangle(-6, 3);

sample_server.listen(port, hostname, ()=> {
        console.log(`Server running at http: //${hostname}:${port}/`);});