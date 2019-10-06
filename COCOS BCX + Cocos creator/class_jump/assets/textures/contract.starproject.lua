COCOS_AC=10000
SYMBOL = 'COCOS'

function sendstart(to,score)
    score=tonumber(score)
    chainhelper:transfer_from_owner(to,score*COCOS_AC,SYMBOL,true)
end