// Updated JavaScript for the dynamic pie chart, PDF functionality, and input state management
document.getElementById("calculateBtn").addEventListener("click", function () {
  const homePrice = parseFloat(document.getElementById("homePrice").value);
  const downPayment = parseFloat(document.getElementById("downPayment").value);
  const loanYears = parseInt(document.getElementById("loanYears").value);
  const interestRate =
    parseFloat(document.getElementById("interestRate").value) / 100;
    const interestRate01 =
    parseFloat(document.getElementById("interestRate").value);

  const loanValue = homePrice - downPayment;
  const principal = homePrice - downPayment;
  const totalInstallmentsCount = loanYears * 12;
  const monthlyInterestRate = interestRate / 12;
  const monthlyInterestRate01 = interestRate01 / 12;


  const numerator =
    principal *
    monthlyInterestRate *
    Math.pow(1 + monthlyInterestRate, totalInstallmentsCount);
  const denominator =
    Math.pow(1 + monthlyInterestRate, totalInstallmentsCount) - 1;
  const monthlyPayment = numerator / denominator;
  let totalMonthlyInstallment = monthlyPayment;

  const totalInterest = monthlyPayment * totalInstallmentsCount - principal;
  const totalPayment = principal + totalInterest;
  const monthlyInterestPayment = principal * monthlyInterestRate;


  document.getElementById("totalPayment").innerText = totalPayment.toFixed(2);
  document.getElementById("principal").innerText = principal.toFixed(2);
  document.getElementById("totalInterest").innerText = totalInterest.toFixed(2);
  document.getElementById("totalInstallmentCount").innerText = totalInstallmentsCount;
  document.getElementById("totalMonthlyInstallment").innerText = totalMonthlyInstallment.toFixed(2);
  document.getElementById("monthlyInterestRate").innerText = (monthlyInterestRate01);
  console.log(monthlyInterestRate01, "UUUU")

  animateResults("totalPayment", totalPayment);
  animateResults("principal", loanValue);
  animateResults("totalInterest", totalInterest);
  animateResults("totalInstallmentCount", totalInstallmentsCount);
  animateResults("monthlyInterestRate", monthlyInterestRate01);

  generateAmortizationTable(
    principal,
    totalInstallmentsCount,
    monthlyInterestRate,
    monthlyPayment
  );


  let accumulatedPrincipal = 0;
  let accumulatedInterest = 0;
  let remainingPrincipal = principal;

  const accumulatedPrincipalData = [];
  const accumulatedInterestData = [];
  const remainingPrincipalData = [];

  for (let i = 1; i <= totalInstallmentsCount; i++) {
      const interestPayment = remainingPrincipal * monthlyInterestRate;
      let principalPayment = monthlyPayment - interestPayment;

      if (i === totalInstallmentsCount) {
          principalPayment = remainingPrincipal;
      }

      accumulatedPrincipal += principalPayment;
      accumulatedInterest += interestPayment;
      remainingPrincipal -= principalPayment;

      if (remainingPrincipal < 0) remainingPrincipal = 0;

      accumulatedPrincipalData.push(accumulatedPrincipal);
      accumulatedInterestData.push(accumulatedInterest);
      remainingPrincipalData.push(remainingPrincipal);
  }


    // Show chart and table after calculations
    document.getElementById("chartContainer").classList.remove("hidden");
    document.getElementById("amortizationTable").classList.remove("hidden");


  // Create the pie chart
  createPieChart(totalPayment, principal, totalInterest);

      // Create the line chart for accumulated principal, accumulated interest, and remaining principal
      createLineChart(accumulatedPrincipalData, accumulatedInterestData, remainingPrincipalData);



  document.getElementById("downloadPdfBtn").disabled = false;
});

function createPieChart(totalPayment, principal, totalInterest) {
  const ctx = document.getElementById("resultsChart").getContext("2d");
  const data = {
    labels: ["Principal", "Total Interest"],
    datasets: [
      {
        data: [principal, totalInterest],
        backgroundColor: ["#481462", "#7451a9"],
      },
    ],
  };
  new Chart(ctx, {
    type: "pie",
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        datalabels: {
          color: "#fff",
          formatter: (value, context) => {
            const total = context.dataset.data.reduce(
              (acc, val) => acc + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(2);
            return `${value} KD (${percentage}%)`;
          },
        },
      },
    },
    plugins: [
      {
        id: "totalLabel",
        afterDatasetsDraw(chart) {
          const { ctx, data } = chart;
          const total = data.datasets[0].data.reduce(
            (acc, val) => acc + val,
            0
          );
          ctx.save();
          ctx.font = "bold 20px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#000";
          ctx.fillText(
            `Total: ${total.toLocaleString()} KD`,
            chart.chartArea.width / 2,
            chart.chartArea.height / 2
          );
        },
      },
    ],
  });
}

function createLineChart(accumulatedPrincipalData, accumulatedInterestData, remainingPrincipalData) {
  const ctx = document.getElementById("lineChart").getContext("2d");
  new Chart(ctx, {
      type: "line",
      data: {
          labels: Array.from({ length: accumulatedPrincipalData.length }, (_, i) => i + 1),
          datasets: [
              {
                  label: 'Accumulated Principal (KD)',
                  data: accumulatedPrincipalData,
                  borderColor: '#481462',
                  fill: false,
                  tension: 0.1
              },
              {
                  label: 'Accumulated Interest (KD)',
                  data: accumulatedInterestData,
                  borderColor: '#7451a9',
                  fill: false,
                  tension: 0.1
              },
              {
                  label: 'Remaining Principal (KD)',
                  data: remainingPrincipalData,
                  borderColor: '#FF6F61',
                  fill: false,
                  tension: 0.1
              }
          ]
      },
      options: {
          responsive: true,
          plugins: {
              legend: {
                  position: 'bottom'
              }
          },
          scales: {
              x: {
                  title: {
                      display: true,
                      text: 'Month'
                  }
              },
              y: {
                  title: {
                      display: true,
                      text: 'Amount (KD)'
                  },
                  beginAtZero: true
              }
          }
      }
  });
}


function animateResults(id, value) {
  let element = document.getElementById(id);
  let startValue = 0;
  let endValue = formatNumber(value);
  let duration = 2000;
  let startTime = performance.now();

  function update() {
    let elapsed = performance.now() - startTime;
    let progress = Math.min(elapsed / duration, 1);
    let currentValue = Math.floor(progress * value);
    element.textContent = formatNumber(currentValue);
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = endValue;
    }
  }

  update();
}

function generateAmortizationTable(
  principal,
  totalInstallmentsCount,
  monthlyInterestRate,
  monthlyPayment
) {
  let remainingPrincipal = principal;
  let tableRows = "";

  for (let i = 1; i <= totalInstallmentsCount; i++) {
    const interestPayment = remainingPrincipal * monthlyInterestRate;
    let principalPayment = monthlyPayment - interestPayment;
    // Adjust the last payment to account for rounding errors
    if (i === totalInstallmentsCount) {
      principalPayment = remainingPrincipal;
    }
    remainingPrincipal -= principalPayment;
    // Prevent negative remaining balance in the last row
    if (remainingPrincipal < 0) remainingPrincipal = 0;

    tableRows += `<tr>
                      <td>${i}</td>
                      <td>${interestPayment.toFixed(2)}</td>
                      <td>${principalPayment.toFixed(2)}</td>
                      <td>${monthlyPayment.toFixed(2)}</td>
                      <td>${remainingPrincipal.toFixed(2)}</td>
                    </tr>`;
  }

  document.getElementById("paymentTableBody").innerHTML = tableRows;

  // Initialize pagination
  let currentPage = 1;
  const rowsPerPage = 10;
  const rows = document
    .getElementById("paymentTableBody")
    .getElementsByTagName("tr");
  function showPage(page) {
    currentPage = page;
    for (let i = 0; i < rows.length; i++) {
      rows[i].style.display =
        i >= (page - 1) * rowsPerPage && i < page * rowsPerPage ? "" : "none";
    }
    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled =
      currentPage * rowsPerPage >= rows.length;
  }

  showPage(1);

  document.getElementById("prevPage").addEventListener("click", function () {
    if (currentPage > 1) showPage(currentPage - 1);
  });

  document.getElementById("nextPage").addEventListener("click", function () {
    if (currentPage * rowsPerPage < rows.length) showPage(currentPage + 1);
  });
}

document
  .getElementById("downloadPdfBtn")
  .addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedTime = `${hours % 12 || 12}:${
      minutes < 10 ? "0" + minutes : minutes
    } ${ampm}`;
    const formattedDate = `${now.getDate()}/${
      now.getMonth() + 1
    }/${now.getFullYear()} ${formattedTime}`;

    doc.setFontSize(22);
    doc.text("Mortgage Calculator Results", 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${formattedDate}`, 20, 30);

    doc.setFontSize(14);
    doc.setDrawColor(0, 0, 0);
    doc.setFillColor(220, 220, 220);
    doc.roundedRect(10, 40, 190, 40, 3, 3, "F");
    doc.text(
      `Home Price: ${document.getElementById("homePrice").value} KD`,
      15,
      50
    );
    doc.text(
      `Down Payment: ${document.getElementById("downPayment").value} KD`,
      110,
      50
    );
    doc.text(
      `Loan Years: ${document.getElementById("loanYears").value}`,
      15,
      60
    );
    doc.text(
      `Interest Rate: ${document.getElementById("interestRate").value}%`,
      110,
      60
    );

    doc.setFontSize(14);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(10, 70, 190, 50, 3, 3, "F");
    doc.text(
      `Total Payment: ${
        document.getElementById("totalPayment").textContent
      } KD`,
      15,
      80
    );
    doc.text(
      `Principal: ${document.getElementById("principal").textContent} KD`,
      110,
      80
    );
    doc.text(
      `Total Interest: ${
        document.getElementById("totalInterest").textContent
      } KD`,
      15,
      90
    );
    doc.text(
      `Total Interest: ${
        document.getElementById("totalMonthlyInstallment").textContent
      } KD`,
      110,
      90
    );
    doc.text(
      `Total Interest: ${
        document.getElementById("totalInstallmentCount").textContent
      }`,
      15,
      100
    );
    doc.text(
      `Total Interest: ${
        document.getElementById("monthlyInterestRate").textContent
      } %`,
      110,
      100
    );

    const chartCanvas = document.getElementById("resultsChart");
    if (chartCanvas) {
      const chartImage = chartCanvas.toDataURL("image/png");
      doc.addImage(chartImage, "PNG", 10, 130, 85, 85);
    }

    const chartCanvas01 = document.getElementById("lineChart");
    if (chartCanvas01) {
      const chartImage01 = chartCanvas01.toDataURL("image/png");
      doc.addImage(chartImage01, "PNG", 100, 130, 95, 95);
    }

    const table = document.getElementById("amortizationTable");
    let x = 10,
      y = 240;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const tablePadding = 10;
    const rowHeight = 8;

    doc.setFontSize(14);
    doc.text("Amortization Schedule - Full Table", x, y);
    y += 10;

    const headers = [
      "Month",
      "Interest Payment (KD)",
      "Principal Payment (KD)",
      "Total Installment (KD)",
      "Remaining Principal (KD)",
    ];
    const columnWidths = [30, 35, 35, 35, 35];
    const columnSpacing = 4;
    const totalWidth =
      columnWidths.reduce((a, b) => a + b, 0) +
      (columnWidths.length - 1) * columnSpacing;
    const tableWidth = totalWidth + tablePadding * 2;

    function addTableHeader() {
      x = (pageWidth - tableWidth) / 2;
      doc.setFontSize(10);
      doc.setDrawColor(0, 0, 0);
      doc.setFillColor(220, 220, 220);
      doc.rect(x, y, tableWidth, rowHeight, "F");

      let headerX = x + tablePadding;
      headers.forEach((header, index) => {
        doc.text(
          header,
          headerX +
            index * (columnWidths[index] + columnSpacing) +
            columnWidths[index] / 2,
          y + 6,
          { align: "center" }
        );
      });

      y += rowHeight;
    }

    addTableHeader();

    const rows = document.querySelectorAll("#amortizationTable tbody tr");
    for (let i = 0; i < rows.length; i++) {
      if (y + rowHeight > pageHeight - 20) {
        doc.addPage();
        y = 20;
        addTableHeader();
      }
      const cells = Array.from(rows[i].querySelectorAll("td")).map(
        (td) => td.textContent
      );
      let cellX = x + tablePadding;
      cells.forEach((cell, index) => {
        doc.text(
          cell,
          cellX +
            index * (columnWidths[index] + columnSpacing) +
            columnWidths[index] / 2,
          y + 6,
          { align: "center" }
        );
      });
      y += rowHeight;
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${totalPages}`, 180, 290);
      doc.text(`Generated on ${formattedDate}`, 10, 290);
    }

    doc.save("mortgage_calculator_results.pdf");
  });

// Disable PDF button on input change
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", function () {
    document.getElementById("downloadPdfBtn").disabled = true;
  });
});

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", function () {
    // Remove active class from all tab buttons and tab contents
    document
      .querySelectorAll(".tab-button")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((content) => content.classList.remove("active"));

    // Add active class to the clicked button and the corresponding tab content
    this.classList.add("active");
    const tabContent = document.querySelector(
      `.tab-content.${this.dataset.tab}`
    );
    if (tabContent) {
      tabContent.classList.add("active");
    }
  });
});

function formatNumber(number) {
  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".fade-in").forEach(el => {
    el.classList.add("fade-in");
  });
});

document.querySelectorAll(".tab-button").forEach(button => {
  button.addEventListener("click", () => {
    button.classList.add("slide-in");
    setTimeout(() => button.classList.remove("slide-in"), 500);
  });
});


// Show/Hide Back to Top Button on Scroll
window.onscroll = function() {
  const backToTop = document.getElementById("backToTop");
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
};

// Smooth Scroll to Top
document.getElementById("backToTop").addEventListener("click", function(event) {
  event.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});
