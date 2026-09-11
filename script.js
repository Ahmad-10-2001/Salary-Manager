let transactions =
JSON.parse(localStorage.getItem("transactions")) || [];



function save(){

localStorage.setItem(
"transactions",
JSON.stringify(transactions)
);

render();

}





function addTransaction(){


let item={

id:Date.now(),

type:document.getElementById("type").value,

amount:Number(
document.getElementById("amount").value
),

category:
document.getElementById("category").value,


comment:
document.getElementById("comment").value,


date:new Date().toISOString()


};



if(!item.amount){

alert("Enter amount");

return;

}


transactions.unshift(item);


save();


}





function deleteTransaction(id){


transactions =
transactions.filter(
x=>x.id!==id
);


save();


}




function editTransaction(id){


let item =
transactions.find(
x=>x.id===id
);


let amount =
prompt(
"Update amount",
item.amount
);


if(amount){

item.amount=Number(amount);

save();

}


}




function render(){


let balance=0;


let html="";



transactions.forEach(t=>{


if(t.type==="income")
balance+=t.amount;

else
balance-=t.amount;



html+=`

<div class="transaction">


<div class="${t.type}">

${t.type==="income"?"+":"-"}
${t.amount}

</div>


<b>${t.category}</b>

<br>

${t.comment}


<div class="date">

${new Date(t.date).toLocaleString()}

</div>



<button class="edit"
onclick="editTransaction(${t.id})">

Edit

</button>


<button class="delete"
onclick="deleteTransaction(${t.id})">

Delete

</button>



</div>

`;

});



document.getElementById("balance")
.innerText=
balance.toLocaleString();



document.getElementById("transactions")
.innerHTML=
html || "No transactions";


}




function report(days){


let total={};


let limit =
Date.now()-days*86400000;



transactions.forEach(t=>{


if(
t.type==="expense" &&
new Date(t.date).getTime()>limit
){


total[t.category]=
(total[t.category]||0)
+t.amount;


}


});



return Object.keys(total)
.map(
x=>`${x}: ${total[x]}`
)
.join("<br>");

}



function showWeekly(){

document.getElementById("report")
.innerHTML=
report(7)||"No expenses";

}



function showMonthly(){

document.getElementById("report")
.innerHTML=
report(30)||"No expenses";

}




function exportData(){


let blob =
new Blob(
[
JSON.stringify(transactions)
],
{
type:"application/json"
}
);


let a=document.createElement("a");


a.href=
URL.createObjectURL(blob);


a.download=
"salary-backup.json";


a.click();


}




function importData(){


let file =
document.getElementById("importFile")
.files[0];


let reader =
new FileReader();


reader.onload=function(e){


transactions =
JSON.parse(e.target.result);


save();


};



reader.readAsText(file);


}




render();
