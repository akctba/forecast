var actualstring = "A javascript Regular Exp";
var regexp = "Javascript";
var teste = /regexp/.test(actualstring);
//console.log(teste);

var cities = ["Novinite one", "Second Novinita", "Novinite"];
regexp = "novin";

var rx = new RegExp(regexp, "ig");

cities.forEach(el => {
    console.log(el.search(rx));
});
