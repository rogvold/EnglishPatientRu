<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

include('simple_html_dom.php');

function extractSubtitles($youtubeId, $qu){
    $h = file_get_html('http://video.google.com/timedtext?lang=en&name=English&v=' . $youtubeId);
    //echo $h;
    $arr = array();
    $beforeText = "";

    foreach($h->find('text') as $element){
        $text =  $element->innertext;
        $text = preg_replace("/[^A-Za-z0-9]/", "", $text);
        $text = strtolower($text);
        if (strrpos($text, preg_replace("/[^A-Za-z0-9]/", "", $qu)) === false){
            $beforeText = $element->innertext;
            continue;
        }
        if ($element->dur == False){
            continue;
        }
        array_push($arr, array("start" => $element->start, "duration" => $element->dur, "text" => $element->innertext));
        $beforeText = $element->innertext;
    }

    return json_encode($arr);
}


function processVideo($youtubeId){
    $h = file_get_html('http://gdata.youtube.com/feeds/api/videos/' . $youtubeId);
    if ($h == ""){
        return array();
    }
    $category = $h->find('media:category', 0)->label;
    $thumbnail = $h->find('media:thumbnail', 0)->url;
    $title = $h->find('media:title', 0)->innertext;
    $viewCount = $h->find('yt:statistics', 0)->viewCount;

    return array("youtubeId" => $youtubeId, "category" => $category, "thumbNail" => $thumbnail, "title" => $title, "viewCount" => $viewCount);
}

$q = strtolower($_GET["q"]);
$arr = array();
$num = $_GET["n"];

$q = $q;

for ($i = 1; $i <= $num; $i++) {
  $u = "https://www.youtube.com/results?filters=cc&format=5&search_sort=video_view_count&search_query=" . $q ;
  $u = $u . "&page=";
  $u = $u . $i;
  $html = file_get_html($u);
    foreach($html->find('a[class=ux-thumb-wrap]') as $element){
            $y = str_replace("/watch?v=", "", $element->href);
            array_push($arr, processVideo($y, $q));
       }

}

echo json_encode($arr);
//echo $_GET["v"];
//echo json_encode(extractSubtitles($_GET["v"]));

?>