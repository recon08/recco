<?php
header("Access-Control-Allow-Origin: *");
header('Content-type: text/html');

echo file_get_contents("http://labs.funspot.tv/worktest_color_memory/colours.conf");

?>