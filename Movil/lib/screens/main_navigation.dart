import 'package:flutter/material.dart';
import 'home_screen.dart';
import 'services_screen.dart';
import 'chat_screen.dart';
import 'profile_screen.dart';

/// Navegación principal con BottomNavigationBar
class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;

  void _onTabTapped(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> _screens = [
      HomeScreen(onNavigateToTab: _onTabTapped),
      const ServicesScreen(),
      const ChatScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: _onTabTapped,
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(
            key: const Key('nav_home'),
            icon: Semantics(
              label: 'nav_home',
              identifier: 'nav_home',
              button: true,
              enabled: true,
              child: const Icon(Icons.home),
            ),
            label: 'Inicio',
          ),
          BottomNavigationBarItem(
            key: const Key('nav_services'),
            icon: Semantics(
              label: 'nav_services',
              identifier: 'nav_services',
              button: true,
              enabled: true,
              child: const Icon(Icons.search),
            ),
            label: 'Servicios',
          ),
          BottomNavigationBarItem(
            key: const Key('nav_chat'),
            icon: Semantics(
              label: 'nav_chat',
              identifier: 'nav_chat',
              button: true,
              enabled: true,
              child: const Icon(Icons.chat),
            ),
            label: 'Chat',
          ),
          BottomNavigationBarItem(
            key: const Key('nav_profile'),
            icon: Semantics(
              label: 'nav_profile',
              identifier: 'nav_profile',
              button: true,
              enabled: true,
              child: const Icon(Icons.person),
            ),
            label: 'Perfil',
          ),
        ],
      ),
    );
  }
}
