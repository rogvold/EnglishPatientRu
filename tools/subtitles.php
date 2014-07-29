<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');

include('simple_html_dom.php');

function extractSubtitles($youtubeId){
    $h = file_get_html('http://video.google.com/timedtext?lang=en&v=' . $youtubeId);
    if ($h == ""){
      return array();
    }
    //echo $h;
    $arr = array();
    foreach($h->find('text') as $element){
        if ($element->dur == false){
            continue;
        }
        array_push($arr, array("start" => $element->start, "duration" => $element->dur, "text" => $element->innertext));
    }


    return array("subtitles" => $arr, "youtubeId" => $youtubeId);
}


echo json_encode(extractSubtitles($_GET["v"]));

?>