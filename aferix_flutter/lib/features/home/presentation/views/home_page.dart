import 'package:flutter/material.dart';
import 'package:aferix_flutter/domain/repositories/home_repository.dart';
import '../controllers/home_controller.dart';
import 'package:aferix_flutter/features/home/presentation/widgets/home_section_builder.dart';
import 'package:aferix_flutter/domain/usecases/get_home_data.dart';


/// A UI page that integrates the [HomeController] to display home data.
/// This file lives in the presentation layer and may use Flutter widgets.
class HomePage extends StatefulWidget {
  const HomePage({Key? key, required this.repository}) : super(key: key);

  final HomeRepository repository;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late final HomeController _controller;

  @override
  void initState() {
    super.initState();
    _controller = HomeController(GetHomeData(widget.repository));
    _loadData();
  }

  Future<void> _loadData() async {
    await _controller.load();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (_, __) {
        final HomeState state = _controller.state;
        return Scaffold(
          appBar: AppBar(title: const Text('Home')),
          body: HomeSectionBuilder(state: state),
        );
      },
    );
  }



}
