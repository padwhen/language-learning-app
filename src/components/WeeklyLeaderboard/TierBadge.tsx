import { Badge } from "../ui/badge"
import { getTierColor } from "./utils"

export const TierBadge = ({ tier }: { tier: string }) => {
    <Badge className={`${getTierColor(tier)} text-white`}>
        {tier}
    </Badge>
}