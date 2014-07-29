<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');


include('simple_html_dom.php');
$q = $_GET["q"];
$arr = array();

for ($i = 1; $i <= 2; $i++) {

$html = file_get_html('https://www.youtube.com/results?filters=cc&format=5&search_query=' . q . '&page=' . $i);
foreach($html->find('a[class=ux-thumb-wrap]') as $element)
       array_push($arr, $element->href);
}


echo json_encode($arr);

?>