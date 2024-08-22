// Updated JavaScript for the dynamic pie chart, PDF functionality, and input state management
// document.getElementById('calculateBtn').addEventListener('click', function() {

//   if (isNaN(homePrice) || isNaN(downPayment) || isNaN(loanYears) || isNaN(interestRate) || loanYears <= 0 || loanYears > 15) {
//       alert('Please enter valid inputs.');
//       return;
//   }

//   const loanValue = homePrice - downPayment;
//   const totalInterest = loanValue * interestRate * loanYears;
//   const totalPayment = loanValue + totalInterest;
//   const monthlyInterestPayment = (loanValue * interestRate) / 12;
//   const monthlyPrincipal = (loanValue / loanYears) / 12;

//   animateResults('totalPayment', totalPayment);
//   animateResults('principal', loanValue);
//   animateResults('totalInterest', totalInterest);
//   animateResults('monthlyInterest', monthlyInterestPayment);
//   animateResults('monthlyPrincipal', monthlyPrincipal);

//   generateAmortizationTable(loanValue, monthlyInterestPayment, monthlyPrincipal, loanYears);
// });


document.getElementById('calculateBtn').addEventListener('click', function() {
  const homePrice = parseFloat(document.getElementById('homePrice').value);
  const downPayment = parseFloat(document.getElementById('downPayment').value);
  const loanYears = parseInt(document.getElementById('loanYears').value);
  const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;

  const loanValue = homePrice - downPayment;
  const principal = homePrice - downPayment;
  const totalInstallmentsCount = loanYears * 12;
  const monthlyInterestRate = interestRate / 12;

  const numerator = (principal * monthlyInterestRate) * Math.pow((1 + monthlyInterestRate), totalInstallmentsCount);
  const denominator = Math.pow((1 + monthlyInterestRate), totalInstallmentsCount) - 1;
  const monthlyPayment = numerator / denominator;

  const totalInterest = (monthlyPayment * totalInstallmentsCount) - principal;
  const totalPayment = principal + totalInterest;
  const monthlyInterestPayment = (principal * monthlyInterestRate);
  const monthlyPrincipal = principal / totalInstallmentsCount;

  document.getElementById('totalPayment').innerText = totalPayment.toFixed(2);
  document.getElementById('principal').innerText = principal.toFixed(2);
  document.getElementById('totalInterest').innerText = totalInterest.toFixed(2);
  document.getElementById('monthlyInterest').innerText = monthlyInterestPayment.toFixed(2);
  document.getElementById('monthlyPrincipal').innerText = monthlyPrincipal.toFixed(2);
  document.getElementById('totalInstallmentCount').innerText = totalInstallmentsCount;
  document.getElementById('monthlyInterestRate').innerText = (monthlyInterestRate * 100).toFixed(2);

  animateResults('totalPayment', totalPayment);
  animateResults('principal', loanValue);
  animateResults('totalInterest', totalInterest);
  animateResults('monthlyInterest', monthlyInterestPayment);
  animateResults('monthlyPrincipal', monthlyPrincipal);
  animateResults('totalInstallmentCount', totalInstallmentsCount);
  animateResults('monthlyInterestRate', monthlyInterestRate);

  generateAmortizationTable (principal, totalInstallmentsCount, monthlyInterestRate, monthlyPayment);
      // Create the pie chart
      createPieChart(totalPayment, principal, totalInterest);
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
  let tableRows = '';

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

  document.getElementById('paymentTableBody').innerHTML = tableRows;

    // Initialize pagination
    let currentPage = 1;
    const rowsPerPage = 10;
    const rows = document.getElementById('paymentTableBody').getElementsByTagName("tr");
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

document.getElementById('downloadPdfBtn').addEventListener('click', function() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`;
  const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${formattedTime}`;

  doc.setFontSize(22);
  doc.text("Mortgage Calculator Results", 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${formattedDate}`, 20, 30);

  doc.setFontSize(16);
  doc.setDrawColor(0, 0, 0);
  doc.setFillColor(220, 220, 220);
  doc.roundedRect(10, 40, 190, 20, 3, 3, "F");
  doc.text(`Home Price: ${document.getElementById("homePrice").value} KD`, 15, 50);
  doc.text(`Down Payment: ${document.getElementById("downPayment").value} KD`, 110, 50);
  doc.text(`Loan Years: ${document.getElementById("loanYears").value}`, 15, 60);
  doc.text(`Interest Rate: ${document.getElementById("interestRate").value}%`, 110, 60);

  doc.setFontSize(14);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(10, 70, 190, 50, 3, 3, "F");
  doc.text(`Total Payment: ${document.getElementById("totalPayment").textContent} KD`, 15, 80);
  doc.text(`Principal: ${document.getElementById("principal").textContent} KD`, 110, 80);
  doc.text(`Total Interest: ${document.getElementById("totalInterest").textContent} KD`, 15, 90);
  doc.text(`Monthly Interest Payment: ${document.getElementById("monthlyInterest").textContent} KD`, 110, 90);
  doc.text(`Monthly Principal: ${document.getElementById("monthlyPrincipal").textContent} KD`, 15, 100);

  const chartCanvas = document.getElementById("resultsChart");
  if (chartCanvas) {
    const chartImage = chartCanvas.toDataURL("image/png");
    doc.addImage(chartImage, "PNG", 50, 130, 100, 100);
  }

  const table = document.getElementById("amortizationTable");
  let x = 10, y = 240;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const tablePadding = 10;
  const rowHeight = 8;

  doc.setFontSize(14);
  doc.text("Amortization Schedule - Full Table", x, y);
  y += 10;

  const headers = ["Month", "Interest Payment (KD)", "Principal Payment (KD)", "Total Installment (KD)", "Remaining Principal (KD)"];
  const columnWidths = [30, 35, 35, 35, 35];
  const columnSpacing = 4;
  const totalWidth = columnWidths.reduce((a, b) => a + b, 0) + (columnWidths.length - 1) * columnSpacing;
  const tableWidth = totalWidth + tablePadding * 2;

  function addTableHeader() {
    x = (pageWidth - tableWidth) / 2;
    doc.setFontSize(10);
    doc.setDrawColor(0, 0, 0);
    doc.setFillColor(220, 220, 220);
    doc.rect(x, y, tableWidth, rowHeight, "F");

    let headerX = x + tablePadding;
    headers.forEach((header, index) => {
      doc.text(header, headerX + index * (columnWidths[index] + columnSpacing) + columnWidths[index] / 2, y + 6, { align: "center" });
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
    const cells = Array.from(rows[i].querySelectorAll("td")).map(td => td.textContent);
    let cellX = x + tablePadding;
    cells.forEach((cell, index) => {
      doc.text(cell, cellX + index * (columnWidths[index] + columnSpacing) + columnWidths[index] / 2, y + 6, { align: "center" });
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


// document
//   .getElementById("downloadPdfBtn")
//   .addEventListener("click", function () {
//     console.log("NBBB");
//     const jsPDF = window.jspdf.jsPDF;
//     const doc = new jsPDF();

//     // Convert time to 12-hour format
//     const now = new Date();
//     const hours = now.getHours();
//     const minutes = now.getMinutes();
//     const ampm = hours >= 12 ? "PM" : "AM";
//     const formattedTime = `${hours % 12 || 12}:${
//       minutes < 10 ? "0" + minutes : minutes
//     } ${ampm}`;
//     const formattedDate = `${now.getDate()}/${
//       now.getMonth() + 1
//     }/${now.getFullYear()} ${formattedTime}`;

//     doc.setFontSize(22);
//     doc.text("Mortgage Calculator Results", 20, 20);
//     doc.setFontSize(10);
//     doc.text(`Generated on: ${formattedDate}`, 20, 30);

//     // User Inputs with enhanced styling
//     doc.setFontSize(16);
//     doc.setDrawColor(0, 0, 0);
//     doc.setFillColor(220, 220, 220);
//     doc.roundedRect(10, 40, 190, 20, 3, 3, "F");
//     doc.text(
//       `Home Price: ${document.getElementById("homePrice").value} KD`,
//       15,
//       50
//     );
//     doc.text(
//       `Down Payment: ${document.getElementById("downPayment").value} KD`,
//       110,
//       50
//     );
//     doc.text(
//       `Loan Years: ${document.getElementById("loanYears").value}`,
//       15,
//       60
//     );
//     doc.text(
//       `Interest Rate: ${document.getElementById("interestRate").value}%`,
//       110,
//       60
//     );

//     // Results with enhanced styling
//     doc.setFontSize(14);
//     doc.setFillColor(245, 245, 245);
//     doc.roundedRect(10, 70, 190, 50, 3, 3, "F");
//     doc.text(
//       `Total Payment: ${
//         document.getElementById("totalPayment").textContent
//       } KD`,
//       15,
//       80
//     );
//     doc.text(
//       `Principal: ${document.getElementById("principal").textContent} KD`,
//       110,
//       80
//     );
//     doc.text(
//       `Total Interest: ${
//         document.getElementById("totalInterest").textContent
//       } KD`,
//       15,
//       90
//     );
//     doc.text(
//       `Monthly Interest Payment: ${
//         document.getElementById("monthlyInterest").textContent
//       } KD`,
//       110,
//       90
//     );
//     doc.text(
//       `Monthly Principal: ${
//         document.getElementById("monthlyPrincipal").textContent
//       } KD`,
//       15,
//       100
//     );

//     // Adding the pie chart with values
//     const chartCanvas = document.getElementById("resultsChart");
//     if (chartCanvas) {
//       const chartImage = chartCanvas.toDataURL("image/png");
//       doc.addImage(chartImage, "PNG", 50, 130, 100, 100);
//     }

//     // Add the full amortization table with "KD" under the headers
//     const table = document.getElementById("amortizationTable");
//     let x = 10,
//       y = 240;
//     const pageHeight = doc.internal.pageSize.height;
//     const pageWidth = doc.internal.pageSize.width;
//     const tablePadding = 10; // Padding from page edges
//     const rowHeight = 8;
//     let currentRow = 0;

//     doc.setFontSize(14);
//     doc.text("Amortization Schedule - Full Table", x, y);
//     y += 10;

//     // const headers = Array.from(table.querySelectorAll('thead th')).map(th => `${th.textContent}\n(KD)`);
//     const rows = document.querySelectorAll("#amortizationTable tbody tr");
//     const rowsPerPage = Math.floor((pageHeight - y - 20) / rowHeight);

//     // function addTableHeader() {
//     //   const headers = ['Month', 'Interest Payment', 'Principal Payment', 'Total Installment', 'Remaining Principal'];
//     //   headers.forEach((header, index) => {
//     //     doc.text(header, x + (index * 40), y);
//     //   });
//     //   y += 10;
//     // }

//     // Headers and column widths
//     const headers = [
//       "Month",
//       "Interest Payment (KD)",
//       "Principal Payment (KD)",
//       "Total Installment (KD)",
//       "Remaining Principal (KD)",
//     ];
//     const columnWidths = [30, 35, 35, 35, 35]; // Adjusted widths for better spacing
//     const columnSpacing = 4; // Additional space between columns
//     const totalWidth =
//       columnWidths.reduce((a, b) => a + b, 0) +
//       (columnWidths.length - 1) * columnSpacing;
//     const tableWidth = totalWidth + tablePadding * 2; // Adding space for padding

//     function addTableHeader() {
//       // Center the gray rectangle
//       x = (pageWidth - tableWidth) / 2;
//       doc.setFontSize(10); // Reduced font size for better fitting
//       doc.setDrawColor(0, 0, 0);
//       doc.setFillColor(220, 220, 220);
//       doc.rect(x, y, tableWidth, rowHeight, "F");

//       // Adjust column positions
//       let headerX = x + tablePadding;
//       headers.forEach((header, index) => {
//         doc.text(
//           header,
//           headerX +
//             index * (columnWidths[index] + columnSpacing) +
//             columnWidths[index] / 2,
//           y + 6,
//           { align: "center" }
//         );
//       });

//       y += rowHeight;
//     }

//     addTableHeader();

//     for (let i = 0; i < rows.length; i++) {
//       if (y + rowHeight > pageHeight - 20) {
//         doc.addPage();
//         y = 20;
//         addTableHeader();
//       }
//       const cells = Array.from(rows[i].querySelectorAll("td")).map(
//         (td) => td.textContent
//       );
//       let cellX = x + tablePadding;
//       cells.forEach((cell, index) => {
//         doc.text(
//           cell,
//           cellX +
//             index * (columnWidths[index] + columnSpacing) +
//             columnWidths[index] / 2,
//           y + 6,
//           { align: "center" }
//         );
//       });
//       y += rowHeight;
//     }

//     // Footer with page number and time in 12-hour format
//     const totalPages = doc.getNumberOfPages();
//     for (let i = 1; i <= totalPages; i++) {
//       doc.setPage(i);
//       doc.setFontSize(10);
//       doc.text(`Page ${i} of ${totalPages}`, 180, 290);
//       doc.text(`Generated on ${formattedDate}`, 10, 290);
//     }

//     // Save the PDF
//     doc.save("mortgage_calculator_results.pdf");
//   });

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
