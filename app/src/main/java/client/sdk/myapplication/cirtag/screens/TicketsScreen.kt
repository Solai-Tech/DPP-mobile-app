package client.sdk.myapplication.cirtag.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ChatBubbleOutline
import androidx.compose.material.icons.filled.ConfirmationNumber
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import client.sdk.myapplication.cirtag.ui.theme.AmberPale
import client.sdk.myapplication.cirtag.ui.theme.AmberStatus
import client.sdk.myapplication.cirtag.ui.theme.BluePale
import client.sdk.myapplication.cirtag.ui.theme.BlueStatus
import client.sdk.myapplication.cirtag.ui.theme.CirtagGreen
import client.sdk.myapplication.cirtag.ui.theme.CirtagGreenLight
import client.sdk.myapplication.cirtag.ui.theme.CirtagGreenPale
import client.sdk.myapplication.cirtag.ui.theme.Gray100
import client.sdk.myapplication.cirtag.ui.theme.Gray200
import client.sdk.myapplication.cirtag.ui.theme.Gray400
import client.sdk.myapplication.cirtag.ui.theme.OffWhite
import client.sdk.myapplication.cirtag.ui.theme.TextDark
import client.sdk.myapplication.cirtag.ui.theme.TextSecondary

data class ChatMessage(
    val text: String,
    val isFromUser: Boolean,
    val time: String,
    val productReference: ProductReference? = null,
    val showAvatar: Boolean = false
)

data class ProductReference(
    val name: String,
    val id: String
)

data class Ticket(
    val id: String,
    val title: String,
    val description: String,
    val status: TicketStatus,
    val date: String
)

enum class TicketStatus { OPEN, IN_PROGRESS, RESOLVED }

@Composable
fun TicketsScreen() {
    var selectedTab by remember { mutableIntStateOf(0) }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(OffWhite)
        ) {
            // Header
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .padding(top = 16.dp, bottom = 12.dp)
            ) {
                Text(
                    text = "Support & Tickets",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextDark
                )
                Text(
                    text = "Chat with us or track your requests",
                    fontSize = 14.sp,
                    color = TextSecondary
                )
            }

            // Custom Tabs with Icons
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.Start
            ) {
                // Support Chat Tab
                TabItem(
                    icon = Icons.Filled.ChatBubbleOutline,
                    title = "Support Chat",
                    isSelected = selectedTab == 0,
                    onClick = { selectedTab = 0 }
                )

                Spacer(modifier = Modifier.width(24.dp))

                // My Tickets Tab
                TabItem(
                    icon = Icons.Filled.ConfirmationNumber,
                    title = "My Tickets",
                    isSelected = selectedTab == 1,
                    onClick = { selectedTab = 1 }
                )
            }

            // Divider line
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 12.dp)
                    .height(1.dp)
                    .background(Gray200)
            )

            when (selectedTab) {
                0 -> SupportChatTab()
                1 -> MyTicketsTab()
            }
        }

        // FAB for new ticket - shows on both tabs
        FloatingActionButton(
            onClick = { },
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(20.dp),
            containerColor = CirtagGreen,
            contentColor = Color.White,
            shape = RoundedCornerShape(28.dp)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 20.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Filled.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("New Ticket", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
            }
        }
    }
}

@Composable
private fun TabItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Column(
        modifier = Modifier.clickable(onClick = onClick),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(vertical = 8.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = if (isSelected) CirtagGreen else TextSecondary,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = title,
                fontSize = 14.sp,
                fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                color = if (isSelected) CirtagGreen else TextSecondary
            )
        }
        // Underline indicator
        if (isSelected) {
            Box(
                modifier = Modifier
                    .width(100.dp)
                    .height(2.dp)
                    .background(CirtagGreen, RoundedCornerShape(1.dp))
            )
        }
    }
}

@Composable
private fun SupportChatTab() {
    val messages = remember {
        listOf(
            ChatMessage(
                text = "Hi there! \uD83D\uDC4B I can see you just scanned a product. How can I help you today?",
                isFromUser = false,
                time = "9:41 AM",
                productReference = ProductReference("Eco Packaging Unit Pro", "DPP-2024-ECO-00412")
            ),
            ChatMessage(
                text = "The CO₂ value (0.4t) looks off — can you verify?",
                isFromUser = true,
                time = "9:42 AM",
                showAvatar = true
            ),
            ChatMessage(
                text = "Checking batch #204 logs now.",
                isFromUser = false,
                time = "9:42 AM"
            )
        )
    }

    var messageText by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize()) {
        // Agent Bar
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 12.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Agent Avatar
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(CirtagGreenPale),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        "CS",
                        fontWeight = FontWeight.Bold,
                        color = CirtagGreen,
                        fontSize = 16.sp
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        "CIRTAG Support",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = TextDark
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(CirtagGreenLight)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            "Online · replies in ~2 min",
                            fontSize = 13.sp,
                            color = CirtagGreen
                        )
                    }
                }
                IconButton(onClick = { }) {
                    Icon(
                        Icons.Filled.MoreVert,
                        contentDescription = "More",
                        tint = Gray400
                    )
                }
            }
        }

        // Chat Messages
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                Text(
                    "Today, 9:41 AM",
                    fontSize = 12.sp,
                    color = TextSecondary,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    textAlign = TextAlign.Center
                )
            }

            items(messages) { message ->
                ChatBubble(message = message)
            }

            item {
                Spacer(modifier = Modifier.height(8.dp))
                // Quick Reply Chips
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    QuickReplyChip("Yes, open ticket")
                    QuickReplyChip("CO₂ data wrong?")
                }
            }

            item {
                Spacer(modifier = Modifier.height(4.dp))
                QuickReplyChip("Missing info")
            }

            item { Spacer(modifier = Modifier.height(100.dp)) }
        }

        // Message Input
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 12.dp)
                .clip(RoundedCornerShape(28.dp))
                .background(Color.White)
                .border(1.dp, Gray200, RoundedCornerShape(28.dp))
                .padding(horizontal = 4.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = messageText,
                onValueChange = { messageText = it },
                placeholder = {
                    Text(
                        "Type a message...",
                        color = Gray400,
                        fontSize = 14.sp
                    )
                },
                modifier = Modifier.weight(1f),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color.Transparent,
                    unfocusedBorderColor = Color.Transparent,
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent
                ),
                singleLine = true
            )
            IconButton(
                onClick = { },
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(CirtagGreen)
            ) {
                Icon(
                    Icons.Filled.Send,
                    contentDescription = "Send",
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

@Composable
private fun ChatBubble(message: ChatMessage) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (message.isFromUser) Arrangement.End else Arrangement.Start,
        verticalAlignment = Alignment.Bottom
    ) {
        // Agent avatar on left for non-user messages
        if (!message.isFromUser) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(CirtagGreenPale),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    "CS",
                    fontWeight = FontWeight.Bold,
                    color = CirtagGreen,
                    fontSize = 11.sp
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
        }

        Column(
            horizontalAlignment = if (message.isFromUser) Alignment.End else Alignment.Start
        ) {
            Box(
                modifier = Modifier
                    .widthIn(max = 260.dp)
                    .clip(
                        RoundedCornerShape(
                            topStart = 16.dp,
                            topEnd = 16.dp,
                            bottomStart = if (message.isFromUser) 16.dp else 4.dp,
                            bottomEnd = if (message.isFromUser) 4.dp else 16.dp
                        )
                    )
                    .background(if (message.isFromUser) CirtagGreenPale else Color.White)
                    .then(
                        if (!message.isFromUser) Modifier.border(
                            1.dp,
                            Gray100,
                            RoundedCornerShape(
                                topStart = 16.dp,
                                topEnd = 16.dp,
                                bottomStart = 4.dp,
                                bottomEnd = 16.dp
                            )
                        ) else Modifier
                    )
                    .padding(12.dp)
            ) {
                Column {
                    Text(
                        text = message.text,
                        fontSize = 14.sp,
                        color = TextDark,
                        lineHeight = 20.sp
                    )

                    message.productReference?.let { ref ->
                        Spacer(modifier = Modifier.height(10.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(Gray100)
                                .padding(10.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(CirtagGreenPale),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        Icons.Filled.Inventory2,
                                        contentDescription = null,
                                        tint = CirtagGreen,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        ref.name,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = TextDark
                                    )
                                    Text(
                                        ref.id,
                                        fontSize = 12.sp,
                                        color = CirtagGreen
                                    )
                                }
                            }
                        }
                    }
                }
            }
            Text(
                text = message.time,
                fontSize = 11.sp,
                color = TextSecondary,
                modifier = Modifier.padding(top = 4.dp, start = 4.dp, end = 4.dp)
            )
        }

        // User avatar on right
        if (message.isFromUser && message.showAvatar) {
            Spacer(modifier = Modifier.width(8.dp))
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(CirtagGreen),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    "AN",
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    fontSize = 11.sp
                )
            }
        }
    }
}

@Composable
private fun QuickReplyChip(text: String) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .border(1.5.dp, CirtagGreen, RoundedCornerShape(20.dp))
            .clickable { }
            .padding(horizontal = 16.dp, vertical = 10.dp)
    ) {
        Text(
            text = text,
            fontSize = 13.sp,
            color = CirtagGreen,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
private fun MyTicketsTab() {
    val tickets = remember {
        listOf(
            Ticket("TKT-001", "CO₂ data verification", "Batch #204 verification request", TicketStatus.OPEN, "Today"),
            Ticket("TKT-002", "Missing certification", "ISO 14001 cert not showing", TicketStatus.IN_PROGRESS, "Yesterday"),
            Ticket("TKT-003", "Product update request", "Update supplier info", TicketStatus.RESOLVED, "2 days ago")
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp, vertical = 16.dp)
    ) {
        // Stats Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            TicketStatCard(
                count = "2",
                label = "Open",
                color = AmberStatus,
                bgColor = AmberPale,
                modifier = Modifier.weight(1f)
            )
            TicketStatCard(
                count = "1",
                label = "In Progress",
                color = BlueStatus,
                bgColor = BluePale,
                modifier = Modifier.weight(1f)
            )
            TicketStatCard(
                count = "5",
                label = "Resolved",
                color = CirtagGreen,
                bgColor = CirtagGreenPale,
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Tickets List
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(tickets) { ticket ->
                TicketCard(ticket = ticket)
            }
            item { Spacer(modifier = Modifier.height(100.dp)) }
        }
    }
}

@Composable
private fun TicketStatCard(
    count: String,
    label: String,
    color: Color,
    bgColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = bgColor)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp, horizontal = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = count,
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
                color = color
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = label,
                fontSize = 12.sp,
                color = color,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
private fun TicketCard(ticket: Ticket) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Status indicator bar
            Box(
                modifier = Modifier
                    .size(4.dp, 44.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(
                        when (ticket.status) {
                            TicketStatus.OPEN -> AmberStatus
                            TicketStatus.IN_PROGRESS -> BlueStatus
                            TicketStatus.RESOLVED -> CirtagGreen
                        }
                    )
            )

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = ticket.title,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextDark
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = ticket.description,
                    fontSize = 13.sp,
                    color = TextSecondary
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = ticket.id,
                        fontSize = 11.sp,
                        color = Gray400
                    )
                    Text(" · ", fontSize = 11.sp, color = Gray400)
                    Text(
                        text = ticket.date,
                        fontSize = 11.sp,
                        color = Gray400
                    )
                }
            }

            // Status badge
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(
                        when (ticket.status) {
                            TicketStatus.OPEN -> AmberPale
                            TicketStatus.IN_PROGRESS -> BluePale
                            TicketStatus.RESOLVED -> CirtagGreenPale
                        }
                    )
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text(
                    text = when (ticket.status) {
                        TicketStatus.OPEN -> "Open"
                        TicketStatus.IN_PROGRESS -> "In Progress"
                        TicketStatus.RESOLVED -> "Resolved"
                    },
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = when (ticket.status) {
                        TicketStatus.OPEN -> AmberStatus
                        TicketStatus.IN_PROGRESS -> BlueStatus
                        TicketStatus.RESOLVED -> CirtagGreen
                    }
                )
            }
        }
    }
}
