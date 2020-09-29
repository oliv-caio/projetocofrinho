var lblSaldo = document.getElementById("lblSaldo");
var txtQuantia = document.getElementById("txtQuantia");
var btnEfetuar = document.getElementById("btnEfetuar");
var lblMovimento = document.getElementById("lblMovimento")

$("#txtQuantia").mask("Z0999999999,99", {
    translation: {
        "Z": {
            pattern: /\-/,
            optional: true
        }
    }
});

function txtQuantiaChange() {
    var quantia = parseFloat(txtQuantia.value.replace(",", "."));
    if (isNaN(quantia) || quantia >= 0) {
        btnEfetuar.textContent = "Depositar";
        btnEfetuar.className = "btn btn-success";
    } else {
        btnEfetuar.textContent = "Sacar";
        btnEfetuar.className = "btn btn-danger";
    }
}

function btnEfetuarClick() {
    var quantia = parseFloat(txtQuantia.value.replace(",", "."));
    if (isNaN(quantia) || quantia === 0) {
        return;
    }

    if (quantia < 0) {
        // @@@
        $.ajax({
            url: "/sacar?quantia=" + -quantia,
            success: function(quantia) {
                lblSaldo.textContent = quantia.toFixed(2).replace(".", ",");
            },
            error: function() {
                alert("Algo deu errado :(");
            }
        })
        alert("Saque");
    } else {
        $.ajax({
            url: "/depositar?quantia=" + quantia,
            success: function(quantia) {
                lblSaldo.textContent = quantia.toFixed(2).replace(".", ",");
                lblMovimento = quantia.toFixed(2).replace(".", ",");
            },
            error: function() {
                alert("Algo deu errado :(");
            }
        })
        alert("Depósito");
    }
}

$.ajax({
    url: "/consultar",
    success: function(valor) {
        lblSaldo.textContent = valor.toFixed(2).replace(".", ",");
    },
    error: function() {
        alert("Algo deu errado :(");
    }
});