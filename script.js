document.getElementById('calculateBtn').addEventListener('click', function() {
  const homePrice = parseFloat(document.getElementById('homePrice').value);
  const downPayment = parseFloat(document.getElementById('downPayment').value);
  const loanYears = parseFloat(document.getElementById('loanYears').value);
  const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;

  if (isNaN(homePrice) || isNaN(downPayment) || isNaN(loanYears) || isNaN(interestRate) || loanYears <= 0 || loanYears > 15) {
      alert('Please enter valid inputs.');
      return;
  }

  const loanValue = homePrice - downPayment;
  const totalInterest = loanValue * interestRate * loanYears;
  const totalPayment = loanValue + totalInterest;
  const monthlyInterestPayment = (loanValue * interestRate) / 12;
  const monthlyPrincipal = (loanValue / loanYears) / 12;

  animateResults('totalPayment', totalPayment);
  animateResults('principal', loanValue);
  animateResults('totalInterest', totalInterest);
  animateResults('monthlyInterest', monthlyInterestPayment);
  animateResults('monthlyPrincipal', monthlyPrincipal);

  generateAmortizationTable(loanValue, monthlyInterestPayment, monthlyPrincipal, loanYears);
});

function formatNumber(number) {
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function animateResults(id, value) {
  let element = document.getElementById(id);
  let startValue = 0;
  let endValue = formatNumber(value);
  let duration = 2000; // animation duration in ms
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

function generateAmortizationTable(loanValue, monthlyInterestPayment, monthlyPrincipal, loanYears) {
  const tableBody = document.getElementById('amortizationTable').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = ''; // Clear existing rows
  let remainingPrincipal = loanValue;
  let month = 0;
  
  for (let i = 0; i < loanYears * 12; i++) {
      month++;
      let principalPayment = Math.min(monthlyPrincipal, remainingPrincipal);
      remainingPrincipal -= principalPayment;
      if (remainingPrincipal < 0) remainingPrincipal = 0;
      
      let row = tableBody.insertRow();
      row.insertCell(0).textContent = month;
      row.insertCell(1).textContent = formatNumber(monthlyInterestPayment);
      row.insertCell(2).textContent = formatNumber(principalPayment);
      row.insertCell(3).textContent = formatNumber(monthlyInterestPayment + principalPayment);
      row.insertCell(4).textContent = formatNumber(remainingPrincipal);
  }
  
  // Initialize pagination
  let currentPage = 1;
  const rowsPerPage = 10;
  const rows = tableBody.getElementsByTagName('tr');
  function showPage(page) {
      currentPage = page;
      for (let i = 0; i < rows.length; i++) {
          rows[i].style.display = (i >= (page - 1) * rowsPerPage && i < page * rowsPerPage) ? '' : 'none';
      }
      document.getElementById('prevPage').disabled = currentPage === 1;
      document.getElementById('nextPage').disabled = currentPage * rowsPerPage >= rows.length;
  }
  
  showPage(1);
  
  document.getElementById('prevPage').addEventListener('click', function() {
      if (currentPage > 1) showPage(currentPage - 1);
  });
  
  document.getElementById('nextPage').addEventListener('click', function() {
      if (currentPage * rowsPerPage < rows.length) showPage(currentPage + 1);
  });
}

// PDF Download functionality
document.getElementById('downloadPdfBtn').addEventListener('click', function() {
  const jsPDF = window.jspdf.jsPDF;
  const doc = new jsPDF();

  // Title
  doc.setFontSize(22);
  doc.text('Mortgage Calculator Results', 20, 20);
  
  // Results
  doc.setFontSize(16);
  doc.text(`Total Payment: ${document.getElementById('totalPayment').textContent} KD`, 20, 40);
  doc.text(`Principal: ${document.getElementById('principal').textContent} KD`, 20, 50);
  doc.text(`Total Interest: ${document.getElementById('totalInterest').textContent} KD`, 20, 60);
  doc.text(`Monthly Interest Payment: ${document.getElementById('monthlyInterest').textContent} KD`, 20, 70);
  doc.text(`Monthly Principal: ${document.getElementById('monthlyPrincipal').textContent} KD`, 20, 80);

  // Add Amortization Table
  const table = document.getElementById('amortizationTable');
  let x = 20, y = 100;
  doc.setFontSize(14);
  doc.text('Amortization Schedule', x, y);
  y += 10;

  // Table headers
  const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
  headers.forEach((header, index) => {
      doc.text(header, x + (index * 40), y);
  });
  y += 10;

  // Table rows
  Array.from(table.querySelectorAll('tbody tr')).forEach(row => {
      const cells = Array.from(row.querySelectorAll('td')).map(td => td.textContent);
      cells.forEach((cell, index) => {
          doc.text(cell, x + (index * 40), y);
      });
      y += 10;
  });

  doc.save('mortgage_calculator_results.pdf');
});



document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', function() {
    console.log('Button clicked:', this.dataset.tab); // Debugging line
    
    // Remove active class from all tab buttons and tab contents
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to the clicked button and the corresponding tab content
    this.classList.add('active');
    const tabContent = document.querySelector(`.tab-content.${this.dataset.tab}`);
    if (tabContent) {
      tabContent.classList.add('active');
    }
  });
});



