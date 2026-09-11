let transactions = JSON.parse(
    localStorage.getItem("transactions")
) || [];



function addTransaction(){


    let type = document.getElementById("type").value;

    let amount = Number(
        document.getElementById("amount").value
    );


    let category =
        document.getElementById("category").value;


    let comment =
        document.getElementById("comment").value;



    if(!amount){

        alert("Enter amount");

        return;

    }



    let transaction = {


        type:type,

        amount:amount,

        category:category,

        comment:comment,

        date:new Date().toLocaleString()

    };



    transactions.unshift(transaction);



    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );



    document.getElementById("amount").value="";

    document.getElementById("comment").value="";


    render();


}





function render(){


    let balance=0;


    let report={};



    transactions.forEach(item=>{


        if(item.type==="income"){

            balance += item.amount;

        }

        else {


            balance -= item.amount;



            report[item.category] =
            (report[item.category] || 0)
            + item.amount;

        }


    });



    document.getElementById("balance")
    .innerText =
    balance.toLocaleString();



    let list="";



    transactions.forEach(item=>{


        list += `

        <div class="transaction">

        <div class="${item.type}">

        ${item.type==="income" ? "+" : "-"}
        ${item.amount}

        </div>


        <b>${item.category}</b>


        <br>

        ${item.comment}


        <div class="date">

        ${item.date}

        </div>


        </div>

        `;


    });



    document.getElementById("transactions")
    .innerHTML =
    list || "No transactions";





    let reportHTML="";


    Object.keys(report).forEach(category=>{


        reportHTML += `

        ${category}:
        ${report[category]}
        <br>

        `;


    });



    document.getElementById("report")
    .innerHTML =
    reportHTML || "No expenses";

}



render();
