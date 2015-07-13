<?php

class Component_share extends Component {
  public function init() {
    OrmManager::LoadModel("share");
  }

  public function controller_share($args) {
    $vars = array();
    return $this->GetComponentResponse("./share.tpl", $vars);
  }
}  
