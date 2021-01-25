/// functionality for filtering plots from a list by their name ///
function filterPlots() {
  var input, filter, ul, li, a, i, txtValue;
  input = document.getElementById("Searchbox");
  filter = input.value.toUpperCase();
  ul = document.getElementById("PlotList");
  li = ul.getElementsByTagName("li");
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("myDropdown");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
      //console.log("a",a[i]);
      //$(a[i]).prop("href","plot.html?"+a[i]);
    } else {
      a[i].style.display = "none";
    }
  }
}